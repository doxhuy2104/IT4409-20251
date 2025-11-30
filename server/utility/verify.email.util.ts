import env from '../env';

export const verifyEmail = (token: string, email: string) => {
	const generateUrl = `${env.app.base_url}/api/auth/verify?token=${token}&email=${email}`;
	return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Xác nhận đăng ký tài khoản</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f9f9f9;
            border-radius: 5px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #2c3e50;
            margin: 0;
            font-size: 24px;
        }
        .content {
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 4px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #2980b9;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #999;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Xác nhận đăng ký tài khoản</h1>
        </div>
        <div class="content">
            <p>Chào bạn,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản với email: <strong>${email}</strong></p>
            <p>Để hoàn tất quá trình đăng ký, vui lòng nhấp vào nút bên dưới để xác nhận địa chỉ email của bạn:</p>
            <div style="text-align: center;">
                <a href="${generateUrl}" class="button">Xác nhận tài khoản</a>
            </div>
            <p>Hoặc bạn có thể sao chép và dán đường dẫn sau vào trình duyệt web:</p>
            <p style="word-break: break-all; font-size: 12px;">${generateUrl}</p>
            <p>Liên kết này sẽ hết hạn sau 24 giờ.</p>
        </div>
        <div class="footer">
            <p>Đây là email tự động, vui lòng không trả lời email này.</p>
            <p>&copy; ${new Date().getFullYear()} ${
		env.app.name || 'Hệ thống'
	}</p>
        </div>
    </div>
</body>
</html>`;
};
