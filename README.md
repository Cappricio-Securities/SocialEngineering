# SOCIAL ENGINEER 🎯🕵️‍♂️

A powerful social engineering toolkit that automates phishing, OTP/email bombing, fake mail and more — built with ❤️ by [@karthithehacker](https://karthithehacker.com)

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

Install dependencies with:

```bash
npm install
```

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
git clone https://github.com/karthi-the-hacker/SocialEngineer.git
cd SocialEngineer
```

2. Install Node.js dependencies:

```bash
npm install
chmod +x SocialEngineering.js   # optional make CLI executable
```

### 📌 Running the tool

```bash
node SocialEngineering.js
# or if installed as bin
./SocialEngineering.js
```

Sample menu:

```
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
  templates/
  ├── yourtemplatename/
      ├── index.html
      └── index.css
  ```
* The phishing server will serve files from the selected template and capture credentials via `/login`.

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
