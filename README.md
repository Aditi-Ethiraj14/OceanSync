# 🌊 OceanSync — Hazardous Incident Reporting App


*OceanSync* is an application that allows users to *report incidents on the sea shore* in real-time, such as drowning cases, oil spills, or other emergencies. Users can capture images, add descriptions, and upload incidents, which are then directed to the relevant authorities via the *API server* for prompt action. Authorities respond *according to the priority* of the alerts.

---

## 🚀 Features

- *Incident Reporting* — Capture images and add descriptions of incidents.  
- *Real-Time Location Logging* — Automatically records the location of reported incidents.  
- *User Dashboard* — Displays:
  - Submitted reports  
  - Map view of incidents  
  - Nearby incidents for awareness  
- *Authority Portal* — Authorities can access:
  - Report details  
  - Incident locations on a map  
  - Manage and respond to incidents based on *priority*  
- *API Server* — Handles report submissions, retrieval, and location data.  
- *Ocean API Integration* — Provides educational and news articles related to the ocean.

---

## 📊 How It Works

1. Users capture an image of the incident and provide a description.  
2. The system logs the *user’s location* automatically.  
3. The incident is uploaded via the *API server* to the authority portal.  
4. Users can view submitted reports, maps, and nearby incidents in their dashboard.  
5. Authorities access detailed reports and respond according to the *priority of the alert*.  
6. Ocean-related API provides news and articles for awareness.

---

## 🛠 Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/OceanSync.git](https://github.com/Aditi-Ethiraj14/OceanSync.git
cd OceanSync
```
2. Set up environment variables (Supabase keys, API keys, etc.)
```bash
.env file
```
4. Start the API server:
```bash
npm run server
```
4. Start the frontend:
```bash
npm start
```
5. Open your browser and navigate to:
```bash
http://localhost:3000

