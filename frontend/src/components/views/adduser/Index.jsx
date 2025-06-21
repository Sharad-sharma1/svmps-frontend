import React, { useEffect, useState } from "react";
import axios from "axios";
import "./adduser.css";

const Adduser = () => {
  const [formData, setFormData] = useState({
    usercode: "",
    name: "",
    surname: "",
    father_or_husband_name: "",
    mother_name: "",
    gender: "",
    birth_date: "",
    mobile_no1: "",
    mobile_no2: "",
    fk_area_id: "",
    fk_village_id: "",
    address: "",
    pincode: "",
    occupation: "",
    country: "",
    state: "",
    email_id: "",
    receipt_flag: false,
    receipt_no: "",
    receipt_date: "",
    receipt_amt: "",
  });

  const [areas, setAreas] = useState([]);
  const [villages, setVillages] = useState([]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios.get("https://svmps-frontend.onrender.com/area/").then((res) => {
      setAreas(res.data.data);
    });
    axios.get("https://svmps-frontend.onrender.com/village/").then((res) => {
      setVillages(res.data.data);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage("");

    // Convert empty strings to null
    const cleanedData = { ...formData };
    Object.keys(cleanedData).forEach((key) => {
      if (cleanedData[key] === "") {
        cleanedData[key] = null;
      }
    });

    try {
      await axios.post("https://svmps-frontend.onrender.com/users/", cleanedData);
      setMessage("User created successfully!");
      setFormData({
        usercode: "",
        name: "",
        surname: "",
        father_or_husband_name: "",
        mother_name: "",
        gender: "",
        birth_date: "",
        mobile_no1: "",
        mobile_no2: "",
        fk_area_id: "",
        fk_village_id: "",
        address: "",
        pincode: "",
        occupation: "",
        country: "",
        state: "",
        email_id: "",
        receipt_flag: false,
        receipt_no: "",
        receipt_date: "",
        receipt_amt: "",
      });
    } catch (error) {
      if (error.response && error.response.status === 422) {
        const fieldErrors = {};
        error.response.data.detail.forEach((err) => {
          const field = err.loc[err.loc.length - 1];
          fieldErrors[field] = err.msg;
        });
        setErrors(fieldErrors);
      } else {
        console.error(error);
        setMessage("Error creating user");
      }
    }
  };

  return (
    <div className="form-container">
      <h2>Create User</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          className={errors.name ? "input-error" : ""}
          required
        />
        {errors.name && <span className="error-text">{errors.name}</span>}

        <input name="surname" value={formData.surname} onChange={handleChange} placeholder="Surname" />

        <input name="father_or_husband_name" value={formData.father_or_husband_name} onChange={handleChange} placeholder="Father/Husband Name" />

        <input name="mother_name" value={formData.mother_name} onChange={handleChange} placeholder="Mother Name" />

        <input name="gender" value={formData.gender} onChange={handleChange} placeholder="Gender" />

        <input name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} className={errors.birth_date ? "input-error" : ""} />
        {errors.birth_date && <span className="error-text">{errors.birth_date}</span>}

        <input name="mobile_no1" value={formData.mobile_no1} onChange={handleChange} placeholder="Mobile 1" />

        <input name="mobile_no2" value={formData.mobile_no2} onChange={handleChange} placeholder="Mobile 2" />

        <select name="fk_area_id" value={formData.fk_area_id} onChange={handleChange}>
          <option value="">Select Area</option>
          {areas.map((a) => (
            <option key={a.area_id} value={a.area_id}>{a.area}</option>
          ))}
        </select>

        <select name="fk_village_id" value={formData.fk_village_id} onChange={handleChange}>
          <option value="">Select Village</option>
          {villages.map((v) => (
            <option key={v.village_id} value={v.village_id}>{v.village}</option>
          ))}
        </select>

        <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
        <input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" />
        <input name="occupation" value={formData.occupation} onChange={handleChange} placeholder="Occupation" />
        <input name="country" value={formData.country} onChange={handleChange} placeholder="Country" />
        <input name="state" value={formData.state} onChange={handleChange} placeholder="State" />
        <input name="email_id" value={formData.email_id} onChange={handleChange} placeholder="Email" />

        <div className="receipt-section">
          <label className="receipt-label">
            Receipt Issued?
            <input type="checkbox" name="receipt_flag" checked={formData.receipt_flag} onChange={handleChange} />
          </label>
          <input name="receipt_no" value={formData.receipt_no} onChange={handleChange} placeholder="Receipt No" />
          <input name="receipt_date" type="date" value={formData.receipt_date} onChange={handleChange} />
          <input name="receipt_amt" type="number" value={formData.receipt_amt} onChange={handleChange} placeholder="Amount" />
        </div>

        <button type="submit">Create User</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default Adduser;
