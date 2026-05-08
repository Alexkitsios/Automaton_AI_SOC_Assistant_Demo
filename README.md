# Automaton | Enterprise SOAR & AI Copilot (Interactive Demo)

![JavaScript](https://img.shields.io/badge/Vanilla_JS-ES6-F7DF1E.svg)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC.svg)
![ChartJS](https://img.shields.io/badge/Chart.js-Data_Viz-FF6384.svg)
![Status](https://img.shields.io/badge/Status-Interactive_Mockup-success.svg)

**Automaton** is a robust, custom-built Security Orchestration, Automation, and Response (SOAR) platform designed for modern Security Operations Centers (SOC). It features an interactive Glassmorphism UI, Role-Based Access Control (RBAC), and an AI-driven ChatOps assistant powered by OpenAI.

> ⚠️ **Note:** This repository hosts the **Interactive Frontend Demo** of Automaton. To protect Intellectual Property (IP), backend integrations (FastAPI, SQLite, Docker, Python APIs) and API Keys have been replaced with simulated mock data.

---

## ⚡ Try the Live Demo
You can explore the interactive dashboard here:
👉 **[Launch Automaton SOAR Demo](https://alexkitsios.github.io/Automaton_AI_SOC_Assistant_Demo/)** *(Use credentials: **demo / demo** to sign in)*

---

## System Architecture & Workflow (Production Version)

While this demo uses static mock data, the actual production architecture of Automaton operates as follows:

### 1. SIEM Telemetry Ingestion & Correlation
Automaton acts as the central nervous system of a SOC. It features a custom REST API (FastAPI) designed to ingest raw webhook payloads from Enterprise SIEMs (like **Splunk**, **Microsoft Sentinel**, and **Wazuh**).
* It parses massive JSON log files, correlates events based on IP and MITRE ATT&CK tactics, and queues them dynamically in the SOC Dashboard.
* Real-time WebSockets push new threats to the Analyst's screen without requiring page refreshes.

### 2. Context-Aware AI Copilot (Level 3 Analyst)
Unlike simple chatbots, Automaton integrates **OpenAI (GPT-3.5-Turbo / GPT-4)** using *Context Injection*.
* **Dynamic Threat Analysis:** When an analyst clicks on an alert, the Backend sends the raw SIEM payload to the LLM with strict instructions to return a structured JSON response. The UI then elegantly displays the MITRE Tactic, Containment steps, and Confidence Score.
* **Automated Audit Drafts:** Upon resolving an incident, the AI automatically generates a C-Level ready audit log detailing the threat and the SOAR actions taken.

### 3. Automated Incident Response (SOAR Playbooks)
Automaton drastically reduces Mean Time To Respond (MTTR) by executing complex scripts directly from the browser. The system dynamically reads the Alert Category and provides only the relevant containment options:

* 🔒 **Perimeter Defense (pfSense):** Triggers an SSH payload (via Paramiko) directly to the enterprise firewall, executing `easyrule block wan` to instantly drop all traffic from a malicious external IP.
* 💻 **Endpoint Isolation (Wazuh EDR):** Sends an authenticated API request to the Wazuh Manager, initiating an Active Response (`netsh`) to apply a strict Windows Defender Firewall block on the compromised host.
* 👤 **Identity Containment (OpenLDAP / Active Directory):** Interfaces with the Enterprise Directory to instantly scramble user credentials and lock compromised accounts (e.g., during "Impossible Travel" or "Pass-the-Hash" alerts).
* 🔌 **Physical Infrastructure Shutdown (Ansible):** The "Nuclear Option" for Ransomware containment. The Python backend spins up ephemeral Docker containers running Ansible Playbooks that execute Layer-2 isolation (port shutdown) on Cisco Core Switches.

more to come...

---

## Technologies Used

* **Frontend:** Vanilla JavaScript (ES6), HTML5, CSS3, Tailwind CSS (Utility-first styling).
* **Data Visualization:** Chart.js for real-time alert volume and severity tracking.
* **Backend (Production):** Python 3.11, FastAPI, WebSockets.
* **Database & Auth (Production):** SQLite, JWT (JSON Web Tokens), Bcrypt Hashing.
* **Integrations (Production):** Docker API, Paramiko (SSH), LDAP3, Requests, OpenAI SDK.

---

## 🤝 Acknowledgments & Credits

* **Frontend UI/CSS:** The core glassmorphism layout and styling elements were adapted from [Bembit's CodePen](https://codepen.io/Bembit/pen/JoYGZOa) (Licensed under MIT).
* **AI Engine:** Powered by OpenAI `gpt-3.5-turbo`.
