📂 Backend Setup
✅ Prerequisites
Python 3.9+

⚙️ Environment Setup
Navigate to the backend folder and create a virtual environment:

python -m venv env_be
Note: The virtual environment (env_be) is excluded via .gitignore.

Activate the virtual environment:

Windows (PowerShell):

powershell
.\env_be\Scripts\Activate.ps1
macOS/Linux:

source env_be/bin/activate
Install the required dependencies:

pip install -r requirements.txt
Run the FastAPI server with Uvicorn:

uvicorn main:app --reload --port 8002
The backend will be accessible at: https://svmps-frontend.onrender.com

--------------------------------------------------------------------------------

💻 Frontend Setup
✅ Prerequisites
Node.js (v14+ recommended)

⚙️ Environment Setup
Navigate to the frontend folder:

cd frontend
Install the frontend dependencies:

npm install
Start the development server:

npm run dev
The frontend will be accessible at: http://localhost:3000

-------------------------------------------------------------------------------

📌 Notes
Make sure to activate the Python environment every time before running the backend.

Default ports:

Backend: 8002

Frontend: 3000

Modify .env files or configuration as needed for your environment.

📁 Project Structure
svmps_frontend/
│
├── backend/
│   ├── env_be/                # Python virtual environment (excluded from Git)
│   ├── main.py                # FastAPI entry point
│   └── requirements.txt       # Python dependencies
│
├── frontend/
│   ├── node_modules/          # Node dependencies
│   ├── public/                # Static assets
│   ├── src/                   # Source code
│   └── package.json           # npm config
│
└── README.md