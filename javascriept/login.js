const apiBaseUrl = "http://localhost:8080/user";

// Show Register Form
function showRegister() {
  document.getElementById('fom').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
}

// Show Sign In Form
function showSignIn() {
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('fom').style.display = 'block';
}

// User Login
async function log() {
  const email = document.getElementById('txtEmailForLog').value.trim();
  const password = document.getElementById('txtPasswordForLog').value;

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/searchByEmail/${encodeURIComponent(email)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || "Invalid login credentials.";
      throw new Error(errorMessage);
    }

    let user = await response.json();

    // if (user.password !== password) {
    //   throw new Error("Invalid password. Please try again.");
    // }

    console.log("Login successful:",user);
    // alert("Login successful!");

   

    window.location.href = 'Home.html';
  } catch (error) {
    console.error("Error during login:", error);
    alert("Login failed: " + error.message);
  }
}

// User Registration
async function register() {
  const name = document.getElementById('txtName').value.trim();
  const email = document.getElementById('txtEmail').value.trim();
  const password = document.getElementById('txtPassword').value.trim();

  if (!name || !email || !password) {
    alert("All fields are required.");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  const payload = { name, email, password };

  try {
    const response = await fetch(`${apiBaseUrl}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || "Registration failed.";
      throw new Error(errorMessage);
    }

    console.log("User registered successfully.");
    alert("Registration successful! Please log in.");
    showSignIn(); // Switch to sign-in form
  } catch (error) {
    console.error("Error during registration:", error);
    alert("Registration failed: " + error.message);
  }
}
