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

// Endpoint สำหรับเข้าสู่ระบบ
$app->post('/login4', function (Request $request, Response $response, array $args) use ($conn) {
    $body = $request->getBody();
    $bodyArr = json_decode($body, true);

    if (!isset($bodyArr['email']) || !isset($bodyArr['password'])) {
        return $response->withHeader('Content-Type', 'application/json')
                        ->withStatus(400)
                        ->write(json_encode(['error' => 'Email and password are required.']));
    }

    $email = htmlspecialchars($bodyArr['email']);
    $password = htmlspecialchars($bodyArr['password']);

    // คำสั่ง SQL สำหรับตรวจสอบข้อมูลสมาชิก
    $stmt = $conn->prepare("SELECT member_id, prefix, first_name, last_name, phone, email, password, member_status FROM members WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($member_id, $prefix, $first_name, $last_name, $phone, $email_db, $hashed_password, $member_status);

    if ($stmt->num_rows > 0) {
        $stmt->fetch();
        if (password_verify($password, $hashed_password)) {
            $response->getBody()->write(json_encode([
                'member_id' => $member_id,
                'prefix' => $prefix,
                'first_name' => $first_name,
                'last_name' => $last_name,
                'phone' => $phone,
                'email' => $email_db,
                'member_status' => $member_status
            ]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } else {
            return $response->withHeader('Content-Type', 'application/json')
                            ->withStatus(401)
                            ->write(json_encode(['error' => 'Invalid password']));
        }
    } else {
        return $response->withHeader('Content-Type', 'application/json')
                        ->withStatus(404)
                        ->write(json_encode(['error' => 'Email not found']));
    }

    return $response->withHeader('Content-Type', 'application/json');
});

///////////////register
$app->post('/register1', function (Request $request, Response $response, array $args) use ($conn) {
    $body = $request->getBody();
    $bodyArr = json_decode($body, true);


    $prefix = htmlspecialchars($bodyArr['prefix']);
    $first_name = htmlspecialchars($bodyArr['first_name']);
    $last_name = htmlspecialchars($bodyArr['last_name']);
    $phone = htmlspecialchars($bodyArr['phone']);
    $email = htmlspecialchars($bodyArr['email']);
    $password = htmlspecialchars($bodyArr['password']);

    $stmt = $conn->prepare("SELECT email FROM members WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $response->getBody()->write(json_encode(['error' => 'Email already exists']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }

    $hashed_password = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $conn->prepare("INSERT INTO members (prefix, first_name, last_name, phone, email, password, created_at) 
                            VALUES (?, ?, ?, ?, ?, ?, NOW())");
    $stmt->bind_param("ssssss", $prefix, $first_name, $last_name, $phone, $email, $hashed_password);

    if ($stmt->execute()) {
        $response->getBody()->write(json_encode(['success' => 'Registration successful']));
    } else {
        $response->getBody()->write(json_encode(['error' => 'Registration failed']));
    }

    return $response->withHeader('Content-Type', 'application/json');
});
////แสดงบูธที่จอง
$app->post('/showBookings13', function (Request $request, Response $response, array $args) use ($conn) {
    $body = $request->getBody();
    $bodyArr = json_decode($body, true);

    // ดึงข้อมูลอีเมลจาก JSON
    $email = htmlspecialchars($bodyArr['email']);

    // ตรวจสอบการมีอยู่ของอีเมลในฐานข้อมูล
    $stmtLoginCheck = $conn->prepare(
        "SELECT member_id FROM members WHERE email = ?"
    );
    $stmtLoginCheck->bind_param("s", $email);
    $stmtLoginCheck->execute();
    $result = $stmtLoginCheck->get_result();

    // หากไม่มีอีเมลในฐานข้อมูล
    if ($result->num_rows === 0) {
        $response->getBody()->write(json_encode(['error' => 'Invalid email'])); // ปรับข้อความ
        return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
    }

    $row = $result->fetch_assoc();
    $member_id = $row['member_id'];

    // ดึงข้อมูลการจองจาก member_id
    $stmtBookings = $conn->prepare(
        "SELECT b.booking_id, bo.booth_name, bo.price, bo.booth_info ,bo.booth_id, bo.size , b.booking_status, p.project_name
         FROM bookings b
         JOIN booths bo ON b.booth_id = bo.booth_id
         JOIN projects p ON bo.project_id = p.project_id
         WHERE b.member_id = ? AND b.booking_status != 'ยกเลิก'"
    );
    $stmtBookings->bind_param("i", $member_id);
    $stmtBookings->execute();
    $resultBookings = $stmtBookings->get_result();

    $bookings = [];
    while ($row = $resultBookings->fetch_assoc()) {
        $bookings[] = [
            'booth_name' => htmlspecialchars($row['booth_name']),
            'project_name' => htmlspecialchars($row['project_name']),
            'booking_id' => htmlspecialchars($row['booking_id']),
            'price' => htmlspecialchars($row['price']),
            'booth_id' => htmlspecialchars($row['booth_id']),
            'booth_info' => htmlspecialchars($row['booth_info']),
            'size' => htmlspecialchars($row['size']),
            'status' => htmlspecialchars($row['booking_status'])

        ];
    }

    // ถ้าไม่มีการจอง
    if (empty($bookings)) {
        $response->getBody()->write(json_encode(['message' => 'No bookings found']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }

    // ส่งข้อมูลการจองกลับ
    $response->getBody()->write(json_encode($bookings));
    return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
});
////ยกเลิกการจอง
$app->post('/cancelBooking11', function (Request $request, Response $response, array $args) use ($conn) {
    $body = $request->getBody();
    $bodyArr = json_decode($body, true);

    $booking_id = intval(htmlspecialchars($bodyArr['booking_id']));

    $stmtCheckBooking = $conn->prepare("SELECT booth_id, booking_status FROM bookings WHERE booking_id = ?");
    $stmtCheckBooking->bind_param("i", $booking_id);
    $stmtCheckBooking->execute();
    $result = $stmtCheckBooking->get_result();

    if ($result->num_rows === 0) {
        $response->getBody()->write(json_encode(['error' => 'Booking ID ' . $booking_id . ' does not exist']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }

    $row = $result->fetch_assoc();
    $booth_id = $row['booth_id'];
    $booking_status = $row['booking_status'];

    if ($booking_status !== 'อยู่ระหว่างตรวจสอบ'){
        $response->getBody()->write(json_encode(['error' => 'Booking ID ' . $booking_id . ' cannot be cancelled'])); 
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }

    $stmtUpdateBooking = $conn->prepare("UPDATE bookings SET booking_status = 'ยกเลิก' WHERE booking_id = ?");
    $stmtUpdateBooking->bind_param("i", $booking_id);

    if (!$stmtUpdateBooking->execute()) {
        $response->getBody()->write(json_encode(['error' => 'Failed to update booking status']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }

    $stmtUpdateBooth = $conn->prepare("UPDATE booths SET status = 'ว่าง' WHERE booth_id = ?");
    $stmtUpdateBooth->bind_param("i", $booth_id);

    if (!$stmtUpdateBooth->execute()) {
        $response->getBody()->write(json_encode(['error' => 'Failed to update booth status']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }

    $response->getBody()->write(json_encode([
        'success' => 'Booking cancelled and booth status updated successfully',
        'booking_id' => $booking_id
    ]));
    return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
});
////////เพิ่มวันที่
$app->post('/updateBookingDate', function ($request, $response) use ($conn) {
    // รับข้อมูล JSON จากคำขอ
    $data = json_decode($request->getBody()->getContents(), true); // ใช้ getBody()->getContents()

    // ตรวจสอบว่า booking_id ถูกส่งมาไหม
    if (!isset($data['booking_id']) || empty($data['booking_id'])) {
        $response->getBody()->write(json_encode(["error" => "Booking ID is required"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }

    $booking_id = $data['booking_id'];

    // คำสั่ง SQL สำหรับอัปเดตวันที่และเวลาเป็นปัจจุบัน
    $stmtUpdateBookingDate = $conn->prepare("UPDATE bookings SET booking_date = NOW() WHERE booking_id = ?");
    
    // ผูกค่าของ booking_id
    $stmtUpdateBookingDate->bind_param("i", $booking_id);

    // ทำการอัปเดต
    if ($stmtUpdateBookingDate->execute()) {
        // ตรวจสอบผลการอัปเดต
        if ($stmtUpdateBookingDate->affected_rows > 0) {
            $response->getBody()->write(json_encode([
                "success" => "Booking date updated successfully to current date and time"
            ]));
        } else {
            $response->getBody()->write(json_encode(["error" => "No booking found with the given ID"]));
            return $response->withStatus(404);
        }
    } else {
        $response->getBody()->write(json_encode(["error" => "Failed to update booking date"]));
        return $response->withStatus(500);
    }

    return $response->withHeader('Content-Type', 'application/json');
});
////////เวลา
$app->post('/updateBookingDate121', function ($request, $response) use ($conn) {
    // รับข้อมูล JSON จากคำขอ
    $data = json_decode($request->getBody()->getContents(), true);

    // ตรวจสอบว่า booking_id ถูกส่งมาไหม
    if (!isset($data['booking_id']) || empty($data['booking_id'])) {
        $response->getBody()->write(json_encode(["error" => "Booking ID is required"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }

    $booking_id = $data['booking_id'];

    // คำสั่ง SQL สำหรับอัปเดต booking_date เป็น NULL
    $stmtUpdateBookingDate = $conn->prepare("UPDATE bookings SET booking_date = NULL WHERE booking_id = ?");
    
    // ผูกค่าของ booking_id
    $stmtUpdateBookingDate->bind_param("i", $booking_id);

    // ทำการอัปเดต
    if ($stmtUpdateBookingDate->execute()) {
        // ตรวจสอบผลการอัปเดต
        if ($stmtUpdateBookingDate->affected_rows > 0) {
            $response->getBody()->write(json_encode([
                "success" => "Booking date updated successfully to NULL"
            ]));
        } else {
            $response->getBody()->write(json_encode(["error" => "No booking found with the given ID"]));
            return $response->withStatus(404);
        }
    } else {
        $response->getBody()->write(json_encode(["error" => "Failed to update booking date"]));
        return $response->withStatus(500);
    }

    return $response->withHeader('Content-Type', 'application/json');
});
///////ชำระเงิน
$app->post('/updateBookingStatus10', function (Request $request, Response $response, array $args) use ($conn) {
    // รับข้อมูลจากการร้องขอ
    $body = $request->getBody();
    $bodyArr = json_decode($body, true);
    $booking_id = intval(htmlspecialchars($bodyArr['booking_id']));
    $payment_proof_url = htmlspecialchars($bodyArr['payment_proof_url']);
    
    // ตรวจสอบว่ามี booking_id หรือไม่
    if (empty($booking_id)) {
        $response->getBody()->write(json_encode(['error' => 'Booking ID is required']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }

    // รับวันที่เริ่มงานและวันที่จอง
    $stmtGetEventAndBookingDates = $conn->prepare(
        "SELECT events.start_date, bookings.booking_date 
         FROM events
         JOIN bookings ON events.event_code = bookings.event_code
         WHERE bookings.booking_id = ?"
    );
    $stmtGetEventAndBookingDates->bind_param("i", $booking_id);
    $stmtGetEventAndBookingDates->execute();
    $result = $stmtGetEventAndBookingDates->get_result();

    if ($result->num_rows === 0) {
        $response->getBody()->write(json_encode(['error' => 'Booking ID does not exist or event details not found']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }

    $eventAndBooking = $result->fetch_assoc();
    $start_date = new DateTime($eventAndBooking['start_date']);
    $booking_date = new DateTime($eventAndBooking['booking_date']);

    // คำนวณความแตกต่างของวันที่
    $date_diff = $start_date->diff($booking_date)->days; // คำนวณจำนวนวันต่าง

    if ($date_diff < 5) { // น้อยกว่า 5 วัน
        // ยกเลิกการจอง
        $stmtUpdateBooking = $conn->prepare(
            "UPDATE bookings SET booking_status = 'ยกเลิก' WHERE booking_id = ?"
        );
        $stmtUpdateBooking->bind_param("i", $booking_id);
        $stmtUpdateBooking->execute();

        // อัปเดตสถานะบูธ
        $stmtUpdateBooth = $conn->prepare(
            "UPDATE booths SET status = 'ว่าง' WHERE booth_id = (SELECT booth_id FROM bookings WHERE booking_id = ?)"
        );
        $stmtUpdateBooth->bind_param("i", $booking_id);
        $stmtUpdateBooth->execute();

        $response->getBody()->write(json_encode(['message' => 'ชำระเงินไม่ได้', 'booking_status' => 'ยกเลิก']));
        return $response->withHeader('Content-Type', 'application/json');
    } else {
        // อัปเดตสถานะการจองและการชำระเงิน
        $stmtUpdateBookingStatus = $conn->prepare(
            "UPDATE bookings SET booking_status = 'จองแล้ว' WHERE booking_id = ?"
        );
        $stmtUpdateBookingStatus->bind_param("i", $booking_id);
        $stmtUpdateBookingStatus->execute();

        $stmtUpdatePaymentStatus = $conn->prepare(
            "UPDATE bookings SET payment_status = 'ชำระแล้ว', payment_proof_url = ? WHERE booking_id = ?"
        );
        $stmtUpdatePaymentStatus->bind_param("si", $payment_proof_url, $booking_id);
        $stmtUpdatePaymentStatus->execute();

        $response->getBody()->write(json_encode(['message' => 'ชำระแล้ว']));
        return $response->withHeader('Content-Type', 'application/json');
    }
});
///แก้ไขข้อมูล
$app->post('/updateMember12', function (Request $request, Response $response, array $args) use ($conn) {
    $body = $request->getBody();
    $bodyArr = json_decode($body, true);

    $member_id = intval(htmlspecialchars($bodyArr['member_id']));
    $prefix = htmlspecialchars($bodyArr['prefix']);
    $first_name = htmlspecialchars($bodyArr['first_name']);
    $last_name = htmlspecialchars($bodyArr['last_name']);
    $phone = htmlspecialchars($bodyArr['phone']);
    $email = htmlspecialchars($bodyArr['email']);
    $password = htmlspecialchars($bodyArr['password']);

    $stmtCheckEmail = $conn->prepare("SELECT member_id FROM members WHERE email = ? AND member_id != ?");
    $stmtCheckEmail->bind_param("si", $email, $member_id);
    $stmtCheckEmail->execute();
    $result = $stmtCheckEmail->get_result();
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    if ($result->num_rows > 0) {
        $response->getBody()->write(json_encode(['error' => 'Email already in use']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }

    $stmtUpdateMember = $conn->prepare(
        "UPDATE members 
         SET prefix = ?, first_name = ?, last_name = ?, phone = ?, email = ?, password = ? 
         WHERE member_id = ?"
    );
    $stmtUpdateMember->bind_param("ssssssi", $prefix, $first_name, $last_name, $phone, $email, $hashed_password, $member_id);

    if (!$stmtUpdateMember->execute()) {
        $response->getBody()->write(json_encode(['error' => 'Failed to update member information']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }

    $response->getBody()->write(json_encode([
        'success' => 'Member information updated successfully',
        'member_id' => $member_id
    ]));
    return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
});
///รายชื่อสมาชิก
$app->get('/members23', function (Request $request, Response $response, array $args) use ($conn) {
    $sql = "SELECT first_name, last_name, phone, email FROM members WHERE member_status = 'user'";
    
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $members = $result->fetch_all(MYSQLI_ASSOC);
        $response->getBody()->write(json_encode($members));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(['message' => 'No members found']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }
});
////รายชื่อยังไม่จ่าย
$app->get('/unpaidBookings24', function (Request $request, Response $response, array $args) use ($conn) {
    $sql = "
        SELECT m.first_name, m.last_name, m.phone, b2.booth_name, p.project_name
        FROM bookings AS b
        JOIN members AS m ON b.member_id = m.member_id
        JOIN booths AS b2 ON b.booth_id = b2.booth_id
        JOIN projects AS p ON b2.project_id = p.project_id
        WHERE b.booking_status = 'อยู่ระหว่างตรวจสอบ' AND b.payment_status = 'ยังไม่ได้ชำระ'
    ";
    
    $result = $conn->query($sql);

    if ($result === false) {
        $response->getBody()->write(json_encode(['error' => $conn->error]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
    
    if ($result->num_rows > 0) {
        $unpaidBookings = $result->fetch_all(MYSQLI_ASSOC);
        $response->getBody()->write(json_encode($unpaidBookings));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(['message' => 'No unpaid bookings found']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }
});
///จ่ายแล้ว
$app->get('/paidBookings25', function (Request $request, Response $response, array $args) use ($conn) {
    $sql = "
        SELECT m.first_name, m.last_name, m.phone, b2.booth_name, p.project_name AS zone
        FROM bookings AS b
        JOIN members AS m ON b.member_id = m.member_id
        JOIN booths AS b2 ON b.booth_id = b2.booth_id
        JOIN projects AS p ON b2.project_id = p.project_id
        WHERE b.payment_status = 'ชำระแล้ว'
    ";
    
    $result = $conn->query($sql);

    if ($result === false) {
        $response->getBody()->write(json_encode(['error' => $conn->error]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
    
    error_log("SQL Query: " . $sql);
    error_log("Result Count: " . $result->num_rows);

    if ($result->num_rows > 0) {
        $paidBookings = $result->fetch_all(MYSQLI_ASSOC);
        $response->getBody()->write(json_encode($paidBookings));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(['message' => 'No paid bookings found']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }
});
///26
$app->get('/pendingReviews26', function (Request $request, Response $response, array $args) use ($conn) {
    $sql = "
        SELECT m.first_name, m.last_name, m.phone, b2.booth_name, p.project_name AS zone
        FROM bookings AS b
        JOIN members AS m ON b.member_id = m.member_id
        JOIN booths AS b2 ON b.booth_id = b2.booth_id
        JOIN projects AS p ON b2.project_id = p.project_id
        WHERE booking_status = 'อยู่ระหว่างตรวจสอบ' OR booking_status = 'จองแล้ว'
    ";
    
    $result = $conn->query($sql);

    if ($result === false) {
        $response->getBody()->write(json_encode(['error' => $conn->error]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
    
    error_log("SQL Query: " . $sql);
    error_log("Result Count: " . $result->num_rows);

    if ($result->num_rows > 0) {
        $pendingReviews = $result->fetch_all(MYSQLI_ASSOC);
        $response->getBody()->write(json_encode($pendingReviews));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(['message' => 'No pending reviews found']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }
});
///27
$app->get('/pendingReviews27', function (Request $request, Response $response, array $args) use ($conn) {
    $sql = "
        SELECT m.first_name, m.last_name, m.phone, b2.booth_name, b2.status, b2.price, p.project_name AS projects
        FROM bookings AS b
        JOIN members AS m ON b.member_id = m.member_id
        JOIN booths AS b2 ON b.booth_id = b2.booth_id
        JOIN projects AS p ON b2.project_id = p.project_id
        WHERE b.booking_status IN ('จองแล้ว', 'อยู่ระหว่างตรวจสอบ', 'ตรวจสอบแล้ว')
    ";
    
    $result = $conn->query($sql);

    if ($result === false) {
        $response->getBody()->write(json_encode(['error' => $conn->error]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
    
    error_log("SQL Query: " . $sql);
    error_log("Result Count: " . $result->num_rows);

    if ($result->num_rows > 0) {
        $pendingReviews = $result->fetch_all(MYSQLI_ASSOC);
        $response->getBody()->write(json_encode($pendingReviews));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(['message' => 'No pending reviews found']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }
});
////////14
$app->post('/addEvent14', function (Request $request, Response $response, array $args) use ($conn) {
    $body = $request->getBody();
    $bodyArr = json_decode($body, true);

    $event_code = htmlspecialchars($bodyArr['event_code']);
    $event_name = htmlspecialchars($bodyArr['event_name']);
    $start_date = htmlspecialchars($bodyArr['start_date']);
    $end_date = htmlspecialchars($bodyArr['end_date']);

    $stmt = $conn->prepare("INSERT INTO events (event_code, event_name, start_date, end_date) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $event_code, $event_name, $start_date, $end_date);

    if ($stmt->execute()) {
        $response->getBody()->write(json_encode(['success' => 'Event added successfully']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(['error' => 'Failed to add event']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});
$app->get('/getBookingsWithNullEvent', function (Request $request, Response $response) use ($conn) {
    $sql = "SELECT booking_id, created_at, booking_date,booth_id, member_id FROM bookings WHERE event_code IS NULL";
    
    // Execute the query
    $result = $conn->query($sql);
    
    // Check for query execution error
    if ($result === false) {
        $response->getBody()->write(json_encode(['error' => $conn->error]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }

    // Log the SQL query and result count for debugging
    error_log("SQL Query: " . $sql);
    error_log("Result Count: " . $result->num_rows);

    // Check if there are results
    if ($result->num_rows > 0) {
        $bookings = $result->fetch_all(MYSQLI_ASSOC);
        $response->getBody()->write(json_encode($bookings));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(['message' => 'No bookings found with null event'])); 
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }
});

////event_code
$app->post('/updateEventCode', function (Request $request, Response $response) use ($conn) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    $body = $request->getBody();
    $data = json_decode($body, true);
    
    if (!isset($data['booking_id']) || !isset($data['event_code'])) {
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400)
                        ->write(json_encode(['message' => 'Invalid input']));
    }

    $bookingId = intval(htmlspecialchars($data['booking_id']));
    $eventCode = htmlspecialchars($data['event_code']);

    // ตรวจสอบการเชื่อมต่อฐานข้อมูล
    if ($conn->connect_error) {
        error_log("Connection failed: " . $conn->connect_error);
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500)
                        ->write(json_encode(['message' => 'Database connection failed.']));
    }

    // เตรียมคำสั่ง SQL
    $sql = "UPDATE bookings SET event_code = ? WHERE booking_id = ?";
    $stmt = $conn->prepare($sql);
    
    if ($stmt === false) {
        error_log("Prepare failed: " . $conn->error);
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500)
                        ->write(json_encode(['message' => 'Failed to prepare SQL statement.']));
    }

    // ผูกพารามิเตอร์
    $stmt->bind_param("si", $eventCode, $bookingId);

    if ($stmt->execute()) {
        $responseMessage = ["message" => "Event code updated successfully."];
    } else {
        $responseMessage = ["message" => "Failed to update event code: " . $stmt->error];
    }

    // ปิดการเชื่อมต่อและคืนค่าการตอบสนอง
    $stmt->close();
    $conn->close();

    $response->getBody()->write(json_encode($responseMessage));
    return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
});

$app->get('/getAllEvents1', function (Request $request, Response $response, array $args) use ($conn) {
    // ตรวจสอบการเชื่อมต่อฐานข้อมูล
    if (!$conn) {
        return $response->withStatus(500)
                        ->withHeader('Content-Type', 'application/json')
                        ->write(json_encode(["error" => "Database connection failed."]));
    }

    $sql = "SELECT event_code FROM events";  // ใช้ชื่อ table ที่ถูกต้อง

    // Execute the query
    $result = $conn->query($sql);

    // ตรวจสอบว่าคำสั่ง SQL ทำงานได้หรือไม่
    if ($result === false) {
        return $response->withStatus(500)
                        ->withHeader('Content-Type', 'application/json')
                        ->write(json_encode(["error" => "Failed to execute query: " . $conn->error]));
    }

    error_log("SQL Query: " . $sql);
    error_log("Result Count: " . $result->num_rows);

    // ตรวจสอบว่ามีผลลัพธ์หรือไม่
    if ($result->num_rows > 0) {
        $getAllEvents = $result->fetch_all(MYSQLI_ASSOC);
        $response->getBody()->write(json_encode($getAllEvents));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        return $response->withHeader('Content-Type', 'application/json')
                        ->withStatus(404)
                        ->write(json_encode(['message' => 'No events found']));  // เปลี่ยนข้อความให้สอดคล้อง
    }
});

?>
