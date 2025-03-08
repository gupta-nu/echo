# 📝 Task Organizer – Eisenhower Matrix
A **simple and efficient task manager** built with **React** and **Tailwind CSS**, designed for users with **ADHD and dyslexia**. It uses the **Eisenhower Matrix** to prioritize tasks by urgency and importance, making organization straightforward. Features include **quick task entry, drag-and-drop organization, and a clean, distraction-free interface** for better focus and productivity.

## 📌 Live Demo  
🚀 [Check out the live version on Vercel](https://focuspocus.vercel.app/)  

---

## 🚀 Features

✅ **Quick Task Input** – Press **Enter** to add tasks seamlessly  
✅ **Four Task Categories** – Organizes tasks using the **Eisenhower Matrix**  
✅ **Drag & Drop Functionality** – Move tasks between quadrants effortlessly  
✅ **Task Completion single click** – Mark tasks as completed with a simple click
✅ **exisitng task editing** – edit exisitng tasks by double clicking on that task 
✅ **Clear Completed Tasks** – Remove all completed tasks instantly  
✅ **Modern UI** – Clean and responsive design for a smooth experience  

---

## 🖥️ Tech Stack

- **Frontend:** React, Tailwind CSS  
- **State Management:** React Hooks (`useState`)  
- **Drag & Drop:** Native HTML5 Drag & Drop API  
- **Deployment:** Vercel  

---

## 📦 Installation & Setup

### **1️⃣ Clone the repository**
```sh
git clone https://github.com/gupta-nu/echo.git
cd echo
```

### **2️⃣ Install dependencies**
```sh
npm install
```

### **3️⃣ Start the development server**
```sh
npm run dev
```
Your application should now be running at `http://localhost:5173`.

---

## 🌍 Deployment on Vercel

### **1️⃣ Automatic Deployment (Recommended)**
1. Push your code to a GitHub repository.
2. Link your repository with **Vercel**.
3. Every push to the **main branch** will automatically deploy the latest version.

### **2️⃣ Manual Deployment**
If you've already set up Vercel, you can deploy manually by running:
```sh
vercel --prod
```
Once completed, Vercel will provide a **live URL** where your app is hosted.

---

## 🏗️ Folder Structure

```
/echo
 ├── /src
 │   ├── /components   # Reusable components
 │   ├── /pages        # Main application pages
 │   ├── App.jsx       # Main application component
 │   ├── index.js      # Entry point
 ├── /public           # Static assets
 ├── package.json      # Dependencies and scripts
 ├── tailwind.config.js # Tailwind CSS Configuration
 ├── README.md         # Project documentation
```

---

## 🎯 Future Enhancements

- [ ] User Authentication & Multi-User Support 
- [ ] **real time collaboration**  
- [ ] implement a notpad for quick notetaking 
- [ ] **disturbuted task processing** (event souring with kafka,cqrs,redis caching)
- [ ] //later// offline first architecture
- [ ] be able to create sub tasks in a task(nested tasks)
 
---
