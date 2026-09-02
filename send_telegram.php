<?php
header('Content-Type: application/json');

// Load secret credentials from config file
require_once __DIR__ . '/config.php';

$botToken = TELEGRAM_BOT_TOKEN;
$chatId = TELEGRAM_CHAT_ID;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'error' => 'Invalid request method']);
    exit;
}

$text = $_POST['text'] ?? '';

if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
    $url = "https://api.telegram.org/bot{$botToken}/sendPhoto";
    $postFields = [
        'chat_id' => $chatId,
        'caption' => "📝 *New Question Report*\n\n" . $text,
        'parse_mode' => 'Markdown',
        'photo' => new CURLFile($_FILES['photo']['tmp_name'], $_FILES['photo']['type'], $_FILES['photo']['name'])
    ];
} else {
    $url = "https://api.telegram.org/bot{$botToken}/sendMessage";
    $postFields = [
        'chat_id' => $chatId,
        'text' => "📝 *New Question Report*\n\n" . $text,
        'parse_mode' => 'Markdown'
    ];
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);

echo $result;
