<?php

ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$servername = 'localhost';
$username = 'root';
$password = '';
$dbname = 'u583789277_wag7';

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// ตั้งค่า CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$app->get('/getProjectDetails2', function (Request $request, Response $response, array $args) use ($conn) {
    $sql = "SELECT project_id, project_code, project_name, project_info, total_booths FROM projects";
    
    if ($result = $conn->query($sql)) {
        $data = [];

        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $data[] = [
                    'project_id'  => $row['project_id'],
                    'project_code' => $row['project_code'],
                    'project_name' => $row['project_name'],
                    'project_info' => $row['project_info'],
                    'total_booths' => $row['total_booths']
                ];
            }
            $response->getBody()->write(json_encode($data));
        } else {
            $response->getBody()->write(json_encode(['message' => 'No data found']));
        }
    } else {
        // ตรวจสอบข้อผิดพลาดเมื่อ query ล้มเหลว
        $error = $conn->error;
        $response->getBody()->write(json_encode(['error' => "Query failed: $error"]));
    }

    return $response->withHeader('Content-Type', 'application/json');
});

// ดึงข้อมูล booths ตาม project_id
$app->get('/getBoothDetails/{project_id}', function (Request $request, Response $response, array $args) use ($conn) {
    $projectId = $args['project_id'];

    // Query ที่ดึงข้อมูลบูธที่ตรงกับ project_id
    $sql = "SELECT b.booth_code, b.booth_id, b.booth_info, b.booth_name, b.size, b.status, b.price, p.project_id
            FROM booths b 
            JOIN projects p ON b.project_id = p.project_id  
            WHERE p.project_id = ?";

    // ใช้ prepare statement เพื่อความปลอดภัย
    $stmt = $conn->prepare($sql);

    if ($stmt) {
        $stmt->bind_param("i", $projectId);
        $stmt->execute();
        $result = $stmt->get_result();

        $data = [];

        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $data[] = [
                    'booth_code' => $row['booth_code'],
                    'booth_id' => $row['booth_id'],
                    'booth_name' => $row['booth_name'],
                    'booth_info' => $row['booth_info'],
                    'size' => $row['size'],
                    'status' => $row['status'],
                    'price' => $row['price'],
                    'project_id' => $row['project_id'] // เพิ่ม project_id
                ];
            }
            $response->getBody()->write(json_encode($data));
        } else {
            $response->getBody()->write(json_encode(['message' => 'No data found']));
        }
    } else {
        // ตรวจสอบข้อผิดพลาดเมื่อ prepare ล้มเหลว
        $error = $conn->error;
        $response->getBody()->write(json_encode(['error' => "Failed to prepare statement: $error"]));
    }

    return $response->withHeader('Content-Type', 'application/json');
});

//////////////////////การจอง
$app->post('/Booth8', function (Request $request, Response $response, array $args) use ($conn) {
    $body = $request->getBody();
    $bodyArr = json_decode($body, true);

    $member_id = intval(htmlspecialchars($bodyArr['member_id']));
    $booth_ids = $bodyArr['booth_ids'];

    // ตรวจสอบจำนวนการจอง
    $stmt = $conn->prepare("SELECT COUNT(*) AS count FROM bookings WHERE member_id = ?");
    $stmt->bind_param("i", $member_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $current_booking_count = $row['count'];

    // จำกัดการจองไม่เกิน 4 บูธ
    if ($current_booking_count + count($booth_ids) > 4) {
        $response->getBody()->write(json_encode(['error' => 'You cannot book more than 4 booths']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }

    $stmtCheckStatus = $conn->prepare("SELECT booth_id, status FROM booths WHERE booth_id = ?");

    $booked_booths_details = [];

    foreach ($booth_ids as $booth_id) {
        $stmtCheckStatus->bind_param("i", $booth_id);
        $stmtCheckStatus->execute();
        $result = $stmtCheckStatus->get_result();
        $booth = $result->fetch_assoc();

        if ($booth && $booth['status'] !== 'ว่าง') {
            $response->getBody()->write(json_encode(['error' => 'Booth ID ' . $booth_id . ' is not available']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
    }

//// จองบูธ
    $stmt = $conn->prepare("INSERT INTO bookings (member_id, booth_id, booking_status, payment_status, created_at) 
                            VALUES (?, ?, 'อยู่ระหว่างตรวจสอบ', 'ยังไม่ได้ชำระ', NOW())");

    foreach ($booth_ids as $booth_id) {
        $stmt->bind_param("ii", $member_id, $booth_id);

        if (!$stmt->execute()) {
            $response->getBody()->write(json_encode(['error' => 'Failed to book booth ID ' . $booth_id]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }

        // อัปเดตสถานะบูธ
        $stmtUpdateBooth = $conn->prepare("UPDATE booths SET status = 'จองแล้ว' WHERE booth_id = ?");
        $stmtUpdateBooth->bind_param("i", $booth_id);
        $stmtUpdateBooth->execute();

        // ดึงข้อมูลบูธที่จอง
        $stmtGetBoothDetails = $conn->prepare("SELECT booth_id, booth_code, booth_name,booth_info, size, price, status, project_id, image_url 
                                                FROM booths WHERE booth_id = ?");
        $stmtGetBoothDetails->bind_param("i", $booth_id);
        $stmtGetBoothDetails->execute();
        $result = $stmtGetBoothDetails->get_result();
        $booth_details = $result->fetch_assoc();
        
        $booked_booths_details[] = $booth_details;
    }

    // ส่งข้อมูลบูธที่จองกลับไปยัง Frontend
    $response->getBody()->write(json_encode([
        'success' => 'Booths booked successfully',
        'booked_booths' => $booked_booths_details
    ]));
    
    return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
});

/////แก้ไขโซน
$app->post('/updateProject17', function (Request $request, Response $response, array $args) use ($conn) {
    $body = $request->getBody();
    $bodyArr = json_decode($body, true);
    $project_id = htmlspecialchars($bodyArr['project_id']);
    $project_name = htmlspecialchars($bodyArr['project_name']);
    $total_booths = intval($bodyArr['total_booths']);
    $project_info = htmlspecialchars($bodyArr['project_info']);

    $stmt = $conn->prepare("UPDATE projects SET project_name = ?, total_booths = ? WHERE project_id = ?");
    $stmt->bind_param("sii", $project_name, $total_booths, $project_id); 

    if ($stmt->execute()) {
        $response->getBody()->write(json_encode(['success' => 'Project updated successfully']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(['error' => 'Failed to update project']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

/////////แก้ไขบูธ
$app->post('/updateBooth20', function (Request $request, Response $response, array $args) use ($conn) {
    $body = $request->getBody();
    $bodyArr = json_decode($body, true);

    $booth_code = htmlspecialchars($bodyArr['booth_code']);
    $booth_name = htmlspecialchars($bodyArr['booth_name']);
    $size = htmlspecialchars($bodyArr['size']);
    $booth_info = htmlspecialchars($bodyArr['booth_info']);
    $project_id = htmlspecialchars($bodyArr['project_id']);

    $stmtCheckProject = $conn->prepare("SELECT project_id FROM projects WHERE project_id = ?");
    $stmtCheckProject->bind_param("s", $project_id);
    $stmtCheckProject->execute();
    $resultProject = $stmtCheckProject->get_result();

    if ($resultProject->num_rows === 0) {
        $response->getBody()->write(json_encode(['error' => 'Project ID ' . $project_id . ' does not exist']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }

    $stmt = $conn->prepare("UPDATE booths SET booth_name = ?, size = ?, booth_info = ?, project_id = ? WHERE booth_code = ?");
    $stmt->bind_param("sssss", $booth_name, $size, $booth_info, $project_id, $booth_code);

    if ($stmt->execute()) {
        $response->getBody()->write(json_encode(['success' => 'Booth updated successfully']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(['error' => 'Failed to update booth']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

//////เพิ่มโซน
$app->post('/addProject16', function (Request $request, Response $response, array $args) use ($conn) {
    $body = $request->getBody();
    $bodyArr = json_decode($body, true);

    $project_id = htmlspecialchars($bodyArr['project_id']);
    $project_name = htmlspecialchars($bodyArr['project_name']);
    $total_booths = intval($bodyArr['total_booths']);
    $project_code = htmlspecialchars($bodyArr['project_code']);
    $project_info = htmlspecialchars($bodyArr['project_info']);

    $stmt = $conn->prepare("INSERT INTO projects (project_id, project_name, total_booths, project_code ,project_info) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssiss", $project_id, $project_name, $total_booths, $project_code ,$project_info);

    if ($stmt->execute()) {
        $response->getBody()->write(json_encode(['success' => 'Project added successfully']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(['error' => 'Failed to add project']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

/////เพิ่มบูธ
$app->post('/addBooth19', function (Request $request, Response $response, array $args) use ($conn) {
    $body = $request->getBody();
    $bodyArr = json_decode($body, true);

    $booth_code = htmlspecialchars($bodyArr['booth_code']);
    $booth_name = htmlspecialchars($bodyArr['booth_name']);
    $size = htmlspecialchars($bodyArr['size']);
    $booth_info = htmlspecialchars($bodyArr['booth_info']);
    $project_id = htmlspecialchars($bodyArr['project_id']);
    $price = htmlspecialchars($bodyArr['price']);

    // ตรวจสอบการมีอยู่ของ project_id
    $stmtCheckProject = $conn->prepare("SELECT project_id FROM projects WHERE project_id = ?");
    $stmtCheckProject->bind_param("s", $project_id);
    $stmtCheckProject->execute();
    $resultProject = $stmtCheckProject->get_result();

    if ($resultProject->num_rows === 0) {
        $response->getBody()->write(json_encode(['error' => 'Project ID ' . $project_id . ' does not exist']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }

    // ตรวจสอบการมีอยู่ของ booth_code
    $stmtCheckBooth = $conn->prepare("SELECT booth_code FROM booths WHERE booth_code = ?");
    $stmtCheckBooth->bind_param("s", $booth_code);
    $stmtCheckBooth->execute();
    $resultBooth = $stmtCheckBooth->get_result();

    if ($resultBooth->num_rows > 0) {
        $response->getBody()->write(json_encode(['error' => 'Booth code ' . $booth_code . ' already exists']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }

    // แทรกข้อมูลบูธ
    $stmt = $conn->prepare("INSERT INTO booths (booth_code, booth_name, size, booth_info, project_id, price) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $booth_code, $booth_name, $size, $booth_info, $project_id, $price);

    if ($stmt->execute()) {
        $response->getBody()->write(json_encode(['success' => 'Booth added successfully']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(['error' => 'Failed to add booth']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

////ลบโซน
$app->delete('/deleteProject18/{project_id}', function (Request $request, Response $response, array $args) use ($conn) {
    $project_id = (int)$args['project_id'];

    // ลบข้อมูลโครงการ
    $stmt = $conn->prepare("DELETE FROM projects WHERE project_id = ?");
    $stmt->execute([$project_id]);

    if ($stmt->rowCount() > 0) {
        $response->getBody()->write(json_encode(["message" => "Project deleted successfully"]));
    } else {
        $response->getBody()->write(json_encode(["message" => "Project not found"]));
    }

    return $response->withHeader('Content-Type', 'application/json');
});

//////ลบบูธ
$app->post('/deleteBooth21', function (Request $request, Response $response, array $args) use ($conn) {
    $body = $request->getBody();
    $bodyArr = json_decode($body, true);

    $booth_name = htmlspecialchars($bodyArr['booth_name']);

    $stmt = $conn->prepare("DELETE FROM booths WHERE booth_name = ?");
    $stmt->bind_param("s", $booth_name);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            $response->getBody()->write(json_encode(['success' => 'Booth deleted successfully']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } else {
            $response->getBody()->write(json_encode(['error' => 'No booth found with the given name']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }
    } else {
        $response->getBody()->write(json_encode(['error' => 'Failed to delete booth']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});
///////อนุมัติ
$app->post('/approveBooking22', function (Request $request, Response $response, array $args) use ($conn) {
    $body = $request->getBody();
    $bodyArr = json_decode($body, true);

    $booking_id = htmlspecialchars($bodyArr['booking_id']);

    // ตรวจสอบสถานะการจองและการชำระเงิน
    $stmt = $conn->prepare("SELECT booth_id, booking_status, payment_status FROM bookings WHERE booking_id = ? AND booking_status = 'จองแล้ว'");
    $stmt->bind_param("s", $booking_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $booth_id = $row['booth_id'];
        
        // ตรวจสอบสถานะการชำระเงิน
        if ($row['payment_status'] === 'ชำระแล้ว') {
            // อัปเดตสถานะการจองเป็น 'จองแล้ว'
            $updateBookingStmt = $conn->prepare("UPDATE bookings SET booking_status = 'ตรวจสอบแล้ว' WHERE booking_id = ?");
            $updateBookingStmt->bind_param("s", $booking_id);

            if ($updateBookingStmt->execute()) {
                // อัปเดตสถานะบูธเป็น 'ตรวจสอบแล้ว'
                $updateBoothStmt = $conn->prepare("UPDATE booths SET status = 'ตรวจสอบแล้ว' WHERE booth_id = ?");
                $updateBoothStmt->bind_param("s", $booth_id);
                
                if ($updateBoothStmt->execute()) {
                    $response->getBody()->write(json_encode(['success' => 'Booking approved and booth status updated']));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
                } else {
                    $response->getBody()->write(json_encode(['error' => 'Failed to update booth status']));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
                }
            } else {
                $response->getBody()->write(json_encode(['error' => 'Failed to update booking status']));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
            }
        } else {
            $response->getBody()->write(json_encode(['error' => 'Payment not completed']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
    } else {
        $response->getBody()->write(json_encode(['error' => 'Booking not found or not in review status']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }
});
///ข้อมูล
$app->get('/getBookings', function (Request $request, Response $response, array $args) use ($conn) {
    $stmt = $conn->prepare("SELECT booking_id FROM bookings WHERE booking_status = 'จองแล้ว'");
    $stmt->execute();
    $result = $stmt->get_result();
    
    $bookings = [];
    while ($row = $result->fetch_assoc()) {
        $bookings[] = $row;
    }

    $response->getBody()->write(json_encode($bookings));
    return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
});

?>