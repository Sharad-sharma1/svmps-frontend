import React, { useState } from "react";
import axios from "axios";
import AsyncSelect from "react-select/async";
import { API_URLS } from "../../../utils/fetchurl";
import { useRegularApiCall } from "../../../hooks/useApiCall";
import LoadingOverlay from "../../common/LoadingOverlay";
import "./adduser.css";

const AddUser = () => {
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
    area: "",
    village: "",
    address: "",
    pincode: "",
    occupation: "",
    country: "",
    state: "",
    email_id: "",
    status: "Active",
    type: "ALL",
    receipt_flag: false,
    receipt_no: "",
    receipt_date: "",
    receipt_amt: "",
  });

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  
  // API call hooks
  const { loading, error, execute, reset } = useRegularApiCall();

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

    const cleanedData = { ...formData };
    Object.keys(cleanedData).forEach((key) => {
      if (cleanedData[key] === "") cleanedData[key] = null;
    });

    try {
      await execute(
        ({ signal }) => axios.post(API_URLS.createUser(), cleanedData, { signal }),
        {
          loadingMessage: "Creating user...",
          onSuccess: () => {
            setMessage("✅ User created successfully!");
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
              area: "",
              village: "",
              address: "",
              pincode: "",
              occupation: "",
              country: "",
              state: "",
              email_id: "",
              status: "Active",
              type: "ALL",
              receipt_flag: false,
              receipt_no: "",
              receipt_date: "",
              receipt_amt: "",
            });
          },
          onError: (error) => {
            if (error.originalError?.response && error.originalError.response.status === 422) {
              const fieldErrors = {};
              error.originalError.response.data.detail.forEach((err) => {
                const field = err.loc[err.loc.length - 1];
                fieldErrors[field] = err.msg;
              });
              setErrors(fieldErrors);
            } else {
              console.error(error);
              setMessage("❌ Error creating user");
            }
          }
        }
      );
    } catch (err) {
      // Error handled by hook
    }
  };

  const loadAreaOptions = async (inputValue) => {
    try {
      const res = await axios.get(API_URLS.getAllAreas(), {
        params: { area: inputValue }
      });
      return res.data.data.map((area) => ({
        label: area.area,
        value: area.area_id,
      }));
    } catch (err) {
      console.error("Area fetch failed", err);
      return [];
    }
  };

  const loadVillageOptions = async (inputValue) => {
    try {
      const res = await axios.get(API_URLS.getAllVillages(), {
        params: { village: inputValue }
      });
      return res.data.data.map((village) => ({
        label: village.village,
        value: village.village_id,
      }));
    } catch (err) {
      console.error("Village fetch failed", err);
      return [];
    }
  };

  const handleRetry = () => {
    reset();
  };

  return (
    <>
      <LoadingOverlay 
        isVisible={loading}
        message="Creating user..."
      />
      <LoadingOverlay 
        isVisible={error && !loading}
        message={error?.message}
        isError={true}
        onRetry={error?.canRetry ? handleRetry : null}
      />

      <div className="form-container">
        <h2>Create User</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
        <input name="surname" value={formData.surname} onChange={handleChange} placeholder="Surname" />
        <input name="father_or_husband_name" value={formData.father_or_husband_name} onChange={handleChange} placeholder="Father/Husband Name" />
        <input name="mother_name" value={formData.mother_name} onChange={handleChange} placeholder="Mother Name" />
        <select name="gender" value={formData.gender} onChange={handleChange} style={{ width: "180px" }}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} />
        <input name="mobile_no1" value={formData.mobile_no1} onChange={handleChange} placeholder="Mobile 1" />
        <input name="mobile_no2" value={formData.mobile_no2} onChange={handleChange} placeholder="Mobile 2" />

        <AsyncSelect
          cacheOptions
          defaultOptions
          loadOptions={loadAreaOptions}
          placeholder="Select Area"
          onChange={(selected) =>
            setFormData((prev) => ({
              ...prev,
              fk_area_id: selected?.value || "",
              area: selected?.label || "",
            }))
          }
          value={
            formData.fk_area_id
              ? { value: formData.fk_area_id, label: formData.area }
              : null
          }
          isClearable
          styles={{ container: (base) => ({ ...base, width: 180 }) }}
        />

        <AsyncSelect
          cacheOptions
          defaultOptions
          loadOptions={loadVillageOptions}
          placeholder="Select Village"
          onChange={(selected) =>
            setFormData((prev) => ({
              ...prev,
              fk_village_id: selected?.value || "",
              village: selected?.label || "",
            }))
          }
          value={
            formData.fk_village_id
              ? { value: formData.fk_village_id, label: formData.village }
              : null
          }
          isClearable
          styles={{ container: (base) => ({ ...base, width: 180 }) }}
        />

        <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
        <input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" />
        <input name="occupation" value={formData.occupation} onChange={handleChange} placeholder="Occupation" />
        <input name="country" value={formData.country} onChange={handleChange} placeholder="Country" />
        <input name="state" value={formData.state} onChange={handleChange} placeholder="State" />
        <input name="email_id" value={formData.email_id} onChange={handleChange} placeholder="Email" />

        <select name="status" value={formData.status} onChange={handleChange} style={{ width: "180px" }}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Shifted">Shifted</option>
          <option value="Passed away">Passed away</option>
        </select>

        <select name="type" value={formData.type} onChange={handleChange} style={{ width: "180px" }}>
          <option value="NRS">NRS</option>
          <option value="ALL">ALL</option>
          <option value="Commitee">Commitee</option>
          <option value="Siddhpur">Siddhpur</option>
        </select>

        {/* Receipt section temporarily commented out */}
        {/* <div className="receipt-section">
          <label>
            Receipt Issued?
            <input
              type="checkbox"
              name="receipt_flag"
              checked={formData.receipt_flag}
              onChange={handleChange}
            />
          </label>
          <input name="receipt_no" value={formData.receipt_no} onChange={handleChange} placeholder="Receipt No" />
          <input name="receipt_date" type="date" value={formData.receipt_date} onChange={handleChange} />
          <input name="receipt_amt" type="number" value={formData.receipt_amt} onChange={handleChange} placeholder="Amount" />
        </div> */}

        <button type="submit">Create User</button>
        {message && <p>{message}</p>}
      </form>
      </div>
    </>
  );
};

export default AddUser;
