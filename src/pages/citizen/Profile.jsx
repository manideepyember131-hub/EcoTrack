import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);

  // Logged-in user information
  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  // Change Password states
  const [showPasswordSection, setShowPasswordSection] =
    useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] =
  useState(false);

const [showNewPassword, setShowNewPassword] =
  useState(false);

const [showConfirmPassword, setShowConfirmPassword] =
  useState(false);

  // Help & Support state
  const [showSupportSection, setShowSupportSection] =
    useState(false);

  // =====================================================
  // LOAD LOGGED-IN USER FROM LOCAL STORAGE
  // =====================================================

  useEffect(() => {
  const loadUser = () => {
    const storedUser = localStorage.getItem("user");

    console.log("Stored user:", storedUser);

    if (!storedUser) {
      console.log("No user found. Redirecting to login.");
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      console.log("Parsed logged-in user:", parsedUser);

      setUser(parsedUser);

      setName(parsedUser.name || "");
      setEmail(parsedUser.email || "");
      setPhone(parsedUser.phone || "");
      setAddress(parsedUser.address || "");
    } catch (error) {
      console.error("Error reading user from localStorage:", error);

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      navigate("/login");
    }
  };

  loadUser();
}, [navigate]);

  // =====================================================
  // SHOW MESSAGE
  // =====================================================

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2200);
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSave = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      showMessage("Please login again");
      navigate("/login");
      return;
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/profile`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
          name,
          email,
          phone,
          address
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to update profile"
      );
    }

    // Updated user returned from MongoDB
    const updatedUser = data.user;

    // Update React state
    setUser(updatedUser);

    setName(updatedUser.name || "");
    setEmail(updatedUser.email || "");
    setPhone(updatedUser.phone || "");
    setAddress(updatedUser.address || "");

    // Update localStorage
    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    setEditing(false);

    showMessage("Profile updated successfully");

  } catch (error) {
    console.error("Profile update error:", error);

    showMessage(
      error.message || "Failed to update profile"
    );
  }
};

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

 const handleChangePassword = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      showMessage("Please login again");
      navigate("/login");
      return;
    }

    // Frontend validation
    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      showMessage(
        "Please fill in all password fields"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage(
        "New passwords do not match"
      );
      return;
    }

    if (newPassword.length < 8) {
      showMessage(
        "New password must contain at least 8 characters"
      );
      return;
    }

    // Send request to backend
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
          "Failed to change password"
      );
    }

    // Clear fields
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    // Hide password section
    setShowPasswordSection(false);

    // Reset visibility buttons
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    showMessage(
      "Password changed successfully"
    );

  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    showMessage(
      error.message ||
        "Failed to change password"
    );
  }
};

  // =====================================================
  // HELP & SUPPORT
  // =====================================================

  const handleSupport = () => {
    setShowSupportSection(
      !showSupportSection
    );

    setShowPasswordSection(false);
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (confirmLogout) {
      // Remove authentication information
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      showMessage("Logged out successfully");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    }
  };

  // =====================================================
  // IF USER DATA IS STILL LOADING
  // =====================================================

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8ff]">
        <p className="text-gray-600">
          Loading profile...
        </p>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div
      className={`min-h-screen pb-24 transition-colors ${
        darkMode
          ? "bg-[#0f172a] text-white"
          : "bg-[#faf8ff] text-[#131b2e]"
      }`}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className={`sticky top-0 z-40 backdrop-blur-xl border-b ${
          darkMode
            ? "bg-[#0f172a]/90 border-[#334155]"
            : "bg-[#faf8ff]/90 border-[#e2e7ff]"
        }`}
      >
        <div className="px-4 py-4">

          <h1 className="text-xl font-bold">
            Profile
          </h1>

          <p
            className={`text-sm mt-1 ${
              darkMode
                ? "text-gray-300"
                : "text-[#3d4a42]"
            }`}
          >
            Manage your EcoTrack account and preferences
          </p>

        </div>
      </header>


      {/* =====================================================
          PROFILE CARD
      ===================================================== */}

      <section className="px-4 pt-5">

        <div
          className={`rounded-2xl p-5 shadow-sm border ${
            darkMode
              ? "bg-[#1e293b] border-[#334155]"
              : "bg-white border-[#eaedff]"
          }`}
        >

          {/* Avatar */}

          <div className="flex flex-col items-center text-center">

            <div className="relative">

              <div className="w-24 h-24 rounded-full bg-[#85f8c4] flex items-center justify-center">

                <span className="material-symbols-outlined text-[#006948] text-5xl">
                  account_circle
                </span>

              </div>

              {editing && (
                <button
                  type="button"
                  onClick={() =>
                    showMessage(
                      "Profile photo option opened"
                    )
                  }
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#006948] text-white flex items-center justify-center shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    photo_camera
                  </span>
                </button>
              )}

            </div>


            {/* REAL USER NAME */}

            <h2 className="mt-3 text-lg font-bold">
              {name || "EcoTrack Citizen"}
            </h2>


            {/* REAL USER ROLE */}

            <p
              className={`text-sm ${
                darkMode
                  ? "text-gray-300"
                  : "text-[#6d7a72]"
              }`}
            >
              {user.role
                ? user.role.charAt(0).toUpperCase() +
                  user.role.slice(1)
                : "Citizen"}
            </p>

          </div>


          {/* =====================================================
              PROFILE INFORMATION
          ===================================================== */}

          <div className="mt-6 space-y-4">

            {/* NAME */}

            <div>

              <label className="text-xs font-semibold uppercase tracking-wide">
                Full Name
              </label>

              <input
                value={name}
                disabled={!editing}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className={`w-full mt-1 h-11 px-3 rounded-lg border outline-none ${
                  darkMode
                    ? "bg-[#0f172a] border-[#475569] text-white"
                    : "bg-[#f8f9ff] border-[#e2e7ff]"
                } ${
                  !editing
                    ? "opacity-80"
                    : ""
                }`}
              />

            </div>


            {/* EMAIL */}

            <div>

              <label className="text-xs font-semibold uppercase tracking-wide">
                Email
              </label>

              <input
                type="email"
                value={email}
                disabled={!editing}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className={`w-full mt-1 h-11 px-3 rounded-lg border outline-none ${
                  darkMode
                    ? "bg-[#0f172a] border-[#475569] text-white"
                    : "bg-[#f8f9ff] border-[#e2e7ff]"
                } ${
                  !editing
                    ? "opacity-80"
                    : ""
                }`}
              />

            </div>


            {/* PHONE */}

            <div>

              <label className="text-xs font-semibold uppercase tracking-wide">
                Phone
              </label>

              <input
                type="tel"
                value={phone}
                disabled={!editing}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                className={`w-full mt-1 h-11 px-3 rounded-lg border outline-none ${
                  darkMode
                    ? "bg-[#0f172a] border-[#475569] text-white"
                    : "bg-[#f8f9ff] border-[#e2e7ff]"
                } ${
                  !editing
                    ? "opacity-80"
                    : ""
                }`}
              />

            </div>


            {/* ADDRESS */}

            <div>

              <label className="text-xs font-semibold uppercase tracking-wide">
                Address
              </label>

              <input
                value={address}
                disabled={!editing}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
                className={`w-full mt-1 h-11 px-3 rounded-lg border outline-none ${
                  darkMode
                    ? "bg-[#0f172a] border-[#475569] text-white"
                    : "bg-[#f8f9ff] border-[#e2e7ff]"
                } ${
                  !editing
                    ? "opacity-80"
                    : ""
                }`}
              />

            </div>

          </div>


          {/* =====================================================
              EDIT / SAVE
          ===================================================== */}

          <div className="mt-5">

            {!editing ? (

              <button
                type="button"
                onClick={() =>
                  setEditing(true)
                }
                className="w-full h-11 rounded-lg bg-[#006948] text-white font-semibold flex items-center justify-center gap-2"
              >

                <span className="material-symbols-outlined text-[18px]">
                  edit
                </span>

                Edit Profile

              </button>

            ) : (

              <button
                type="button"
                onClick={handleSave}
                className="w-full h-11 rounded-lg bg-[#006948] text-white font-semibold flex items-center justify-center gap-2"
              >

                <span className="material-symbols-outlined text-[18px]">
                  save
                </span>

                Save Changes

              </button>

            )}

          </div>

        </div>

      </section>


      {/* =====================================================
          PREFERENCES
      ===================================================== */}

      <section className="px-4 pt-5">

        <h2 className="font-bold text-lg mb-3">
          Preferences
        </h2>

        <div
          className={`rounded-2xl overflow-hidden shadow-sm border ${
            darkMode
              ? "bg-[#1e293b] border-[#334155]"
              : "bg-white border-[#eaedff]"
          }`}
        >

          {/* Notifications */}

          <div className="p-4 flex items-center justify-between border-b border-inherit">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-[#99efe5] flex items-center justify-center">

                <span className="material-symbols-outlined text-[#006a63]">
                  notifications
                </span>

              </div>

              <div>

                <p className="font-semibold">
                  Notifications
                </p>

                <p className="text-xs opacity-70">
                  Receive EcoTrack updates
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                setNotifications(
                  !notifications
                )
              }
              className={`w-12 h-7 rounded-full p-1 transition ${
                notifications
                  ? "bg-[#006948]"
                  : "bg-gray-400"
              }`}
            >

              <span
                className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  notifications
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />

            </button>

          </div>


          {/* Location */}

          <div className="p-4 flex items-center justify-between border-b border-inherit">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-[#eafdf5] flex items-center justify-center">

                <span className="material-symbols-outlined text-[#006948]">
                  location_on
                </span>

              </div>

              <div>

                <p className="font-semibold">
                  Location Services
                </p>

                <p className="text-xs opacity-70">
                  Help find nearby facilities
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                setLocation(!location)
              }
              className={`w-12 h-7 rounded-full p-1 transition ${
                location
                  ? "bg-[#006948]"
                  : "bg-gray-400"
              }`}
            >

              <span
                className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  location
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />

            </button>

          </div>


          {/* Dark Mode */}

          <div className="p-4 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-[#f2f3ff] flex items-center justify-center">

                <span className="material-symbols-outlined">
                  dark_mode
                </span>

              </div>

              <div>

                <p className="font-semibold">
                  Dark Mode
                </p>

                <p className="text-xs opacity-70">
                  Change the appearance
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                setDarkMode(!darkMode)
              }
              className={`w-12 h-7 rounded-full p-1 transition ${
                darkMode
                  ? "bg-[#006948]"
                  : "bg-gray-400"
              }`}
            >

              <span
                className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  darkMode
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />

            </button>

          </div>

        </div>

      </section>


      {/* =====================================================
          ACCOUNT
      ===================================================== */}

      <section className="px-4 pt-5">

        <h2 className="font-bold text-lg mb-3">
          Account
        </h2>

        <div
          className={`rounded-2xl overflow-hidden shadow-sm border ${
            darkMode
              ? "bg-[#1e293b] border-[#334155]"
              : "bg-white border-[#eaedff]"
          }`}
        >

          {/* Change Password */}

          <button
            type="button"
            onClick={() => {
              setShowPasswordSection(
                !showPasswordSection
              );
              setShowSupportSection(false);
            }}
            className="w-full p-4 flex items-center justify-between border-b border-inherit"
          >

            <div className="flex items-center gap-3">

              <span className="material-symbols-outlined text-[#006948]">
                lock
              </span>

              <span className="font-semibold">
                Change Password
              </span>

            </div>

            <span className="material-symbols-outlined opacity-60">
              {showPasswordSection
                ? "expand_less"
                : "chevron_right"}
            </span>

          </button>


          {/* Change Password Form */}

          {showPasswordSection && (
            <div
              className={`p-4 border-b ${
                darkMode
                  ? "bg-[#0f172a]"
                  : "bg-[#f8f9ff]"
              }`}
            >

              <form
                onSubmit={
                  handleChangePassword
                }
                className="space-y-3"
              >

                <div>

                  <label className="text-xs font-semibold">
                    Current Password
                  </label>

                  <div className="relative">

  <input
    type={
      showCurrentPassword
        ? "text"
        : "password"
    }
    value={currentPassword}
    onChange={(e) =>
      setCurrentPassword(e.target.value)
    }
    placeholder="Enter current password"
    className={`w-full mt-1 h-11 px-3 pr-12 rounded-lg border outline-none ${
      darkMode
        ? "bg-[#1e293b] border-[#475569] text-white"
        : "bg-white border-[#e2e7ff]"
    }`}
  />

  <button
    type="button"
    onClick={() =>
      setShowCurrentPassword(
        !showCurrentPassword
      )
    }
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#006948]"
  >
    <span className="material-symbols-outlined">
      {showCurrentPassword
        ? "visibility_off"
        : "visibility"}
    </span>
  </button>

</div>

                </div>


                <div className="relative">

  <input
    type={
      showNewPassword
        ? "text"
        : "password"
    }
    value={newPassword}
    onChange={(e) =>
      setNewPassword(e.target.value)
    }
    placeholder="Enter new password"
    className={`w-full mt-1 h-11 px-3 pr-12 rounded-lg border outline-none ${
      darkMode
        ? "bg-[#1e293b] border-[#475569] text-white"
        : "bg-white border-[#e2e7ff]"
    }`}
  />

  <button
    type="button"
    onClick={() =>
      setShowNewPassword(
        !showNewPassword
      )
    }
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#006948]"
  >
    <span className="material-symbols-outlined">
      {showNewPassword
        ? "visibility_off"
        : "visibility"}
    </span>
  </button>

</div>


                <div className="relative">

  <input
    type={
      showConfirmPassword
        ? "text"
        : "password"
    }
    value={confirmPassword}
    onChange={(e) =>
      setConfirmPassword(
        e.target.value
      )
    }
    placeholder="Confirm new password"
    className={`w-full mt-1 h-11 px-3 pr-12 rounded-lg border outline-none ${
      darkMode
        ? "bg-[#1e293b] border-[#475569] text-white"
        : "bg-white border-[#e2e7ff]"
    }`}
  />

  <button
    type="button"
    onClick={() =>
      setShowConfirmPassword(
        !showConfirmPassword
      )
    }
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#006948]"
  >
    <span className="material-symbols-outlined">
      {showConfirmPassword
        ? "visibility_off"
        : "visibility"}
    </span>
  </button>

</div>


                <button
                  type="submit"
                  className="w-full h-11 rounded-lg bg-[#006948] text-white font-semibold"
                >
                  Update Password
                </button>

              </form>

            </div>
          )}


          {/* Help & Support */}

          <button
            type="button"
            onClick={handleSupport}
            className="w-full p-4 flex items-center justify-between border-b border-inherit"
          >

            <div className="flex items-center gap-3">

              <span className="material-symbols-outlined text-[#006948]">
                help
              </span>

              <span className="font-semibold">
                Help & Support
              </span>

            </div>

            <span className="material-symbols-outlined opacity-60">
              {showSupportSection
                ? "expand_less"
                : "chevron_right"}
            </span>

          </button>


          {/* Help & Support Content */}

          {showSupportSection && (
            <div
              className={`p-4 border-b ${
                darkMode
                  ? "bg-[#0f172a]"
                  : "bg-[#f8f9ff]"
              }`}
            >

              <div className="space-y-3">

                <div className="flex items-start gap-3">

                  <span className="material-symbols-outlined text-[#006948]">
                    support_agent
                  </span>

                  <div>

                    <p className="font-semibold">
                      EcoTrack Support
                    </p>

                    <p className="text-sm opacity-70">
                      Need help with reporting waste,
                      recycling centers, or your account?
                    </p>

                  </div>

                </div>


                <div className="flex items-center gap-3">

                  <span className="material-symbols-outlined text-[#006948]">
                    email
                  </span>

                  <div>

                    <p className="text-xs opacity-60">
                      Email
                    </p>

                    <p className="font-medium">
                      support@ecotrack.com
                    </p>

                  </div>

                </div>


                <div className="flex items-center gap-3">

                  <span className="material-symbols-outlined text-[#006948]">
                    phone
                  </span>

                  <div>

                    <p className="text-xs opacity-60">
                      Support Helpline
                    </p>

                    <p className="font-medium">
                      +91 1800 123 4567
                    </p>

                  </div>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    showMessage(
                      "Support request submitted"
                    )
                  }
                  className="w-full h-10 rounded-lg bg-[#006948] text-white font-semibold"
                >
                  Contact Support
                </button>

              </div>

            </div>
          )}


          {/* Logout */}

          <button
            type="button"
            onClick={handleLogout}
            className="w-full p-4 flex items-center gap-3 text-red-600"
          >

            <span className="material-symbols-outlined">
              logout
            </span>

            <span className="font-semibold">
              Logout
            </span>

          </button>

        </div>

      </section>


      {/* =====================================================
          TOAST MESSAGE
      ===================================================== */}

      {message && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-[#283044] text-white px-4 py-2.5 rounded-full shadow-xl text-sm">
          {message}
        </div>
      )}

    </div>
  );
};

export default Profile;