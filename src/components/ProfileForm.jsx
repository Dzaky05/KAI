import React from 'react';

const ProfileForm = () => {
  return (
    <div className="profile-container">
      <div className="form-container">
        <img
          src="/KAI_logo.jpg"
          alt="KAI logo"
          className="logo"
        />

        <h1>Profil Pengguna</h1>

        <div className="input-field">
          <input type="text" placeholder="Nama Lengkap" />
        </div>

        <div className="input-field">
          <input type="email" placeholder="Email" />
        </div>

        <div className="input-field">
          <input type="text" placeholder="Jabatan" />
        </div>

        <button className="save-button">Simpan</button>

        <div className="footer">
          © {new Date().getFullYear()} PT Kereta Api Indonesia
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
