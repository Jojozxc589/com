<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use Slim\Exception\HttpNotFoundException;

require __DIR__ . '/vendor/autoload.php';

$app = AppFactory::create();

// ตั้งค่า BasePath ให้ตรงกับเส้นทางที่คุณใช้
// หากคุณเรียก URL แบบนี้ http://localhost/angular-webpro
// ค่า basePath จะต้องเป็น '/angular-webpro'
$app->setBasePath('/angular-webpro');
// เพิ่ม Error Middleware เพื่อแสดง error logs
$app->addErrorMiddleware(true, true, true);

// ดึงไฟล์เชื่อมต่อฐานข้อมูลและ API อื่น ๆ เข้ามา
require __DIR__ . '/dbconnect.php';
require __DIR__ . '/api/login.php';
require __DIR__ . '/api/booth.php';

// จัดการ OPTIONS request เพื่อรองรับ CORS
$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

// Middleware สำหรับจัดการ CORS
$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    return $response
            ->withHeader('Access-Control-Allow-Origin', '*')
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});

$app->get('/ping', function (Request $request, Response $response) {
    $response->getBody()->write("Pong!!!");
    return $response;
});


// กรณีที่ไม่พบ Route ที่กำหนดไว้
$app->map(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], '/{routes:.+}', function ($request, $response) {
    throw new HttpNotFoundException($request);
});

// เริ่มต้นแอปพลิเคชัน
$app->run();
