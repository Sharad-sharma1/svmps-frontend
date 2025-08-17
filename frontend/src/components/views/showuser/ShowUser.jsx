import React, { useEffect, useState } from "react";
import axios from "axios";
import qs from "qs";
import AsyncSelect from "react-select/async";
import { API_URLS } from "../../../utils/fetchurl";
import Pagination from "../../common/Pagination";
import "./Showuser.css";

const ShowUser = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [typeFilters, setTypeFilters] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedVillages, setSelectedVillages] = useState([]);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editSelectedArea, setEditSelectedArea] = useState(null);
  const [editSelectedVillage, setEditSelectedVillage] = useState(null);

  const fetchUsers = async (pageNum = 1, search = "") => {
    try {
      const params = {
        page_num: pageNum,
        name: search,
        type_filter: typeFilters,
        area_ids: selectedAreas.map((a) => a.value),
        village_ids: selectedVillages.map((v) => v.value),
      };

      const response = await axios.get(API_URLS.getAllUsers(), {
        params,
        paramsSerializer: (params) =>
          qs.stringify(params, { arrayFormat: "repeat" }),
      });

      setUsers(response.data.data);
      setTotalCount(response.data.total_count);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setUsers([]);
        setTotalCount(0);
      } else {
        console.error("❌ Failed to fetch users:", err);
      }
    }
  };

  useEffect(() => {
    fetchUsers(page, searchTerm);
  }, [page, searchTerm, typeFilters, selectedAreas, selectedVillages]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(API_URLS.deleteUser(id));
      alert("✅ User deleted successfully.");
      fetchUsers(page, searchTerm);
    } catch (err) {
      console.error("❌ Failed to delete user:", err);
      alert("❌ Failed to delete user.");
    }
  };

  const handleEditClick = (user) => {
    console.log("User data:", user); // Debug log
    setEditUser(user.user_id);
    
    // Set the form data
    const formData = {
      ...user,
      fk_area_id: user.fk_area_id || user.area_id,
      fk_village_id: user.fk_village_id || user.village_id,
      area: user.area,
      village: user.village
    };
    console.log("Form data:", formData); // Debug log
    setEditForm(formData);
    
    // Set the selected area and village for AsyncSelect
    // Since we only have names, we'll need to find the IDs by loading options
    setEditSelectedArea(null);
    setEditSelectedVillage(null);
    
    // Load area ID if area name exists
    if (user.area) {
      loadAreaOptions(user.area).then((options) => {
        console.log("Area options:", options);
        console.log("Looking for area:", user.area);
        const matchedArea = options.find(option => option.label === user.area);
        console.log("Matched area:", matchedArea);
        if (matchedArea) {
          setEditSelectedArea(matchedArea);
          setEditForm(prev => ({
            ...prev,
            fk_area_id: matchedArea.value,
            area: matchedArea.label
          }));
        }
      });
    }
    
    // Load village ID if village name exists
    if (user.village) {
      loadVillageOptions(user.village).then((options) => {
        console.log("Village options:", options);
        console.log("Looking for village:", user.village);
        const matchedVillage = options.find(option => option.label === user.village);
        console.log("Matched village:", matchedVillage);
        if (matchedVillage) {
          setEditSelectedVillage(matchedVillage);
          setEditForm(prev => ({
            ...prev,
            fk_village_id: matchedVillage.value,
            village: matchedVillage.label
          }));
        }
      });
    }
    
    setShowEditPopup(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(API_URLS.updateUser(editUser), editForm);
      alert("✅ User updated successfully.");
      setEditUser(null);
      setShowEditPopup(false);
      setEditSelectedArea(null);
      setEditSelectedVillage(null);
      fetchUsers(page, searchTerm);
    } catch (err) {
      console.error("❌ Failed to update user:", err.response?.data || err);
      alert("❌ Failed to update user.");
    }
  };

  const handleCloseEditPopup = () => {
    setShowEditPopup(false);
    setEditUser(null);
    setEditForm({});
    setEditSelectedArea(null);
    setEditSelectedVillage(null);
  };

  const handleDownloadPDF = async () => {
  try {
    const params = {
      name: searchTerm,
      type_filter: typeFilters,
      area_ids: selectedAreas.map((a) => a.value),
      village_ids: selectedVillages.map((v) => v.value),
      pdf: true,
    };

    const response = await axios.get(API_URLS.getAllUsers(), {
      params,
      paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'users_report.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("❌ Failed to download PDF:", error);
    alert("❌ Error downloading PDF.");
  }
};


  const loadAreaOptions = async (inputValue) => {
    try {
      const res = await axios.get(API_URLS.getAllAreas(), {
        params: { area: inputValue },
      });
      return res.data.data.map((area) => ({
        label: area.area,
        value: area.area_id,
      }));
    } catch (err) {
      console.error("❌ Error loading area options", err);
      return [];
    }
  };

  const loadVillageOptions = async (inputValue) => {
    try {
      const res = await axios.get(API_URLS.getAllVillages(), {
        params: { village: inputValue },
      });
      return res.data.data.map((village) => ({
        label: village.village,
        value: village.village_id,
      }));
    } catch (err) {
      console.error("❌ Error loading village options", err);
      return [];
    }
  };

  const totalPages = Math.ceil(totalCount / 10);

  return (
    <div className="show-user-container">
      <h2>Show User</h2>
      <div className="filters">
  <input
    type="text"
    placeholder="Search by Name / Father Name / Mobile"
    value={searchTerm}
    onChange={handleSearchChange}
  />

  <div className="type-buttons">
    {["ALL", "NRS", "COMMITEE", "SIDDHPUR"].map((type) => (
      <button
        key={type}
        onClick={() =>
          setTypeFilters((prev) =>
            prev.includes(type)
              ? prev.filter((t) => t !== type)
              : [...prev, type]
          )
        }
        className={typeFilters.includes(type) ? "active-type" : ""}
      >
        {type}
      </button>
    ))}
  </div>

  {/* Area Dropdown */}
  <div className="select-wrapper">
    <AsyncSelect
      isMulti
      cacheOptions
      defaultOptions
      loadOptions={loadAreaOptions}
      onChange={(selected) => setSelectedAreas(selected || [])}
      value={selectedAreas}
      placeholder="Filter by Area"
      classNamePrefix="react-select-menu"
      menuPortalTarget={document.body}
    />
  </div>

  {/* Village Dropdown */}
  <div className="select-wrapper">
    <AsyncSelect
      isMulti
      cacheOptions
      defaultOptions
      loadOptions={loadVillageOptions}
      onChange={(selected) => setSelectedVillages(selected || [])}
      value={selectedVillages}
      placeholder="Filter by Village"
      classNamePrefix="react-select-menu"
      menuPortalTarget={document.body}
    />
  </div>
  <button className="download-btn" onClick={handleDownloadPDF}>Download PDF</button>

</div>


      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Actions</th>
              <th>ID</th>
              <th>Name</th>
              <th>Father/Husband</th>
              <th>Surname</th>
              <th>Village</th>
              <th>Area</th>
              <th>Status</th>
              <th>Type</th>
              <th>Address</th>
              <th>Pincode</th>
              <th>State</th>
              <th>User Code</th>
              <th>Mother</th>
              <th>Gender</th>
              <th>Birth Date</th>
              <th>Mobile 1</th>
              <th>Mobile 2</th>
              <th>Email</th>
              <th>Occupation</th>
              <th>Country</th>
            </tr>
          </thead>
          <tbody>
            {users.length ? (
              users.map((user) => (
                <tr key={user.user_id}>
                  <td>
                    <button className="edit-btn" onClick={() => handleEditClick(user)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(user.user_id)}>Delete</button>
                  </td>
                  <td>{user.user_id}</td>
                  <td>{user.name || "-"}</td>
                  <td>{user.father_or_husband_name || "-"}</td>
                  <td>{user.surname || "-"}</td>
                  <td>{user.village || "-"}</td>
                  <td>{user.area || "-"}</td>
                  <td>{user.status || "-"}</td>
                  <td>{user.type || "-"}</td>
                  <td>{user.address || "-"}</td>
                  <td>{user.pincode || "-"}</td>
                  <td>{user.state || "-"}</td>
                  <td>{user.usercode || "-"}</td>
                  <td>{user.mother_name || "-"}</td>
                  <td>{user.gender || "-"}</td>
                  <td>{user.birth_date || "-"}</td>
                  <td>{user.mobile_no1 || "-"}</td>
                  <td>{user.mobile_no2 || "-"}</td>
                  <td>{user.email_id || "-"}</td>
                  <td>{user.occupation || "-"}</td>
                  <td>{user.country || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="21" className="no-data">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <div className="total-count">
          Total Records: {totalCount}
        </div>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* Edit User Popup */}
      {showEditPopup && (
        <div className="popup-overlay">
          <div className="popup-container">
            <div className="popup-header">
              <h2>Edit User</h2>
              <button className="close-btn" onClick={handleCloseEditPopup}>×</button>
            </div>
            {console.log("EditForm data:", editForm)} {/* Debug log */}
            <form className="edit-form" onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }}>
              <input 
                name="name" 
                value={editForm.name || ""} 
                onChange={handleEditChange} 
                placeholder="Name" 
                required 
              />
              <input 
                name="surname" 
                value={editForm.surname || ""} 
                onChange={handleEditChange} 
                placeholder="Surname" 
              />
              <input 
                name="father_or_husband_name" 
                value={editForm.father_or_husband_name || ""} 
                onChange={handleEditChange} 
                placeholder="Father/Husband Name" 
              />
              <input 
                name="mother_name" 
                value={editForm.mother_name || ""} 
                onChange={handleEditChange} 
                placeholder="Mother Name" 
              />
              <input 
                name="gender" 
                value={editForm.gender || ""} 
                onChange={handleEditChange} 
                placeholder="Gender" 
              />
              <input 
                name="birth_date" 
                type="date" 
                value={editForm.birth_date || ""} 
                onChange={handleEditChange} 
              />
              <input 
                name="mobile_no1" 
                value={editForm.mobile_no1 || ""} 
                onChange={handleEditChange} 
                placeholder="Mobile 1" 
              />
              <input 
                name="mobile_no2" 
                value={editForm.mobile_no2 || ""} 
                onChange={handleEditChange} 
                placeholder="Mobile 2" 
              />

              <AsyncSelect
                classNamePrefix="react-select-menu"
                cacheOptions
                defaultOptions
                loadOptions={loadAreaOptions}
                menuPortalTarget={document.body}
                placeholder="Select Area"
                onChange={(selected) => {
                  setEditSelectedArea(selected);
                  setEditForm((prev) => ({
                    ...prev,
                    fk_area_id: selected?.value || "",
                    area: selected?.label || "",
                  }));
                }}
                value={editSelectedArea}
                isClearable
                styles={{ container: (base) => ({ ...base, width: "100%" }) }}
              />

              <AsyncSelect
                classNamePrefix="react-select-menu"
                cacheOptions
                defaultOptions
                loadOptions={loadVillageOptions}
                menuPortalTarget={document.body}
                placeholder="Select Village"
                onChange={(selected) => {
                  setEditSelectedVillage(selected);
                  setEditForm((prev) => ({
                    ...prev,
                    fk_village_id: selected?.value || "",
                    village: selected?.label || "",
                  }));
                }}
                value={editSelectedVillage}
                isClearable
                styles={{ container: (base) => ({ ...base, width: "100%" }) }}
              />

              <input 
                name="address" 
                value={editForm.address || ""} 
                onChange={handleEditChange} 
                placeholder="Address" 
              />
              <input 
                name="pincode" 
                value={editForm.pincode || ""} 
                onChange={handleEditChange} 
                placeholder="Pincode" 
              />
              <input 
                name="occupation" 
                value={editForm.occupation || ""} 
                onChange={handleEditChange} 
                placeholder="Occupation" 
              />
              <input 
                name="country" 
                value={editForm.country || ""} 
                onChange={handleEditChange} 
                placeholder="Country" 
              />
              <input 
                name="state" 
                value={editForm.state || ""} 
                onChange={handleEditChange} 
                placeholder="State" 
              />
              <input 
                name="email_id" 
                value={editForm.email_id || ""} 
                onChange={handleEditChange} 
                placeholder="Email" 
              />
              <input 
                name="usercode" 
                value={editForm.usercode || ""} 
                onChange={handleEditChange} 
                placeholder="User Code" 
              />

              <select 
                name="status" 
                value={editForm.status || ""} 
                onChange={handleEditChange}
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Shifted">Shifted</option>
                <option value="Passed away">Passed away</option>
              </select>

              <select 
                name="type" 
                value={editForm.type || ""} 
                onChange={handleEditChange}
              >
                <option value="">Select Type</option>
                <option value="NRS">NRS</option>
                <option value="ALL">ALL</option>
                <option value="COMMITEE">COMMITEE</option>
                <option value="SIDDHPUR">SIDDHPUR</option>
              </select>

              <div className="popup-buttons">
                <button type="submit" className="save-btn">Update User</button>
                <button type="button" className="cancel-btn" onClick={handleCloseEditPopup}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowUser;
