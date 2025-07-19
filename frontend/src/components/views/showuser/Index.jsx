import React, { useEffect, useState } from "react";
import axios from "axios";
import qs from "qs";
import AsyncSelect from "react-select/async";
import "./Showuser.css";

const Showuser = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [typeFilters, setTypeFilters] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedVillages, setSelectedVillages] = useState([]);

  const fetchUsers = async (pageNum = 1, search = "") => {
    try {
      const params = {
        page_num: pageNum,
        name: search,
        type_filter: typeFilters,
        area_ids: selectedAreas.map((a) => a.value),
        village_ids: selectedVillages.map((v) => v.value),
      };

      const response = await axios.get("http://127.0.0.1:8001/users/", {
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
      await axios.delete(`http://127.0.0.1:8001/users/${id}`);
      alert("✅ User deleted successfully.");
      fetchUsers(page, searchTerm);
    } catch (err) {
      console.error("❌ Failed to delete user:", err);
      alert("❌ Failed to delete user.");
    }
  };

  const handleEditClick = (user) => {
    setEditUser(user.user_id);
    setEditForm({ ...user });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`http://127.0.0.1:8001/users/${editUser}`, editForm);
      alert("✅ User updated successfully.");
      setEditUser(null);
      fetchUsers(page, searchTerm);
    } catch (err) {
      console.error("❌ Failed to update user:", err.response?.data || err);
      alert("❌ Failed to update user.");
    }
  };

  const loadAreaOptions = async (inputValue) => {
    try {
      const res = await axios.get("http://127.0.0.1:8001/area/", {
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
      const res = await axios.get("http://127.0.0.1:8001/village/", {
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

  const handleDownloadPDF = async () => {
  try {
    const params = {
      pdf: true,
      name: searchTerm,
      page_num: page,
      type_filter: typeFilters,
      area_ids: selectedAreas.map((a) => a.value),
      village_ids: selectedVillages.map((v) => v.value),
    };

    const response = await axios.get("http://127.0.0.1:8001/users/", {
      params,
      responseType: "blob",
      paramsSerializer: (params) =>
        qs.stringify(params, { arrayFormat: "repeat" }),
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `users_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("❌ Failed to download PDF:", err);
    alert("❌ Failed to download PDF.");
  }
};


  return (
    <div className="show-user-container">
      <h2>User List</h2>

      <div className="filters">
  <input
    type="text"
    placeholder="Search by name, area, or village..."
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
  <div className="download-pdf-wrapper">
    <button className="download-pdf-btn" onClick={handleDownloadPDF}>
      Download PDF
    </button>
</div>
        <table className="user-table">
          <thead>
            <tr>
              <th>Actions</th>
              <th>ID</th>
              <th>Name</th>
              <th>Village</th>
              <th>Area</th>
              <th>Status</th>
              <th>Type</th>
              <th>Address</th>
              <th>Surname</th>
              <th>Father/Husband</th>
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
                    {editUser === user.user_id ? (
                      <>
                        <button className="save-btn" onClick={handleEditSubmit}>Save</button>
                        <button className="cancel-btn" onClick={() => setEditUser(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="edit-btn" onClick={() => handleEditClick(user)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(user.user_id)}>Delete</button>
                      </>
                    )}
                  </td>
                  <td>{user.user_id}</td>
                  <td>{editUser === user.user_id ? <input name="name" value={editForm.name || ""} onChange={handleEditChange} /> : user.name || "-"}</td>

                  {/* 🟢 Village Select */}
                  <td>
                    {editUser === user.user_id ? (
                      <div className="select-wrapper">
                        <AsyncSelect
                          classNamePrefix="react-select-menu"
                          cacheOptions
                          defaultOptions
                          loadOptions={loadVillageOptions}
                          menuPortalTarget={document.body}
                          onChange={(selected) =>
                            setEditForm((prev) => ({
                              ...prev,
                              fk_village_id: selected?.value,
                              village: selected?.label,
                            }))
                          }
                          value={
                            editForm.fk_village_id
                              ? {
                                  value: editForm.fk_village_id,
                                  label: editForm.village,
                                }
                              : null
                          }
                          isClearable
                          placeholder="Select Village"
                          styles={{ container: (base) => ({ ...base, width: 150 }) }}
                        />
                      </div>
                    ) : user.village || "-"}
                  </td>

                  {/* 🟢 Area Select */}
                  <td>
                    {editUser === user.user_id ? (
                      <div className="select-wrapper">
                        <AsyncSelect
                          classNamePrefix="react-select-menu"
                          cacheOptions
                          defaultOptions
                          loadOptions={loadAreaOptions}
                          menuPortalTarget={document.body}
                          onChange={(selected) =>
                            setEditForm((prev) => ({
                              ...prev,
                              fk_area_id: selected?.value,
                              area: selected?.label,
                            }))
                          }
                          value={
                            editForm.fk_area_id
                              ? {
                                  value: editForm.fk_area_id,
                                  label: editForm.area,
                                }
                              : null
                          }
                          isClearable
                          placeholder="Select Area"
                          styles={{ container: (base) => ({ ...base, width: 150 }) }}
                        />
                      </div>
                    ) : user.area || "-"}
                  </td>

                  {/* All other fields remain the same */}
                  <td>{editUser === user.user_id ? <select name="status" value={editForm.status || ""} onChange={handleEditChange}>
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Shifted">Shifted</option>
                    <option value="Passed away">Passed away</option>
                  </select> : user.status || "-"}</td>
                  <td>{editUser === user.user_id ? <select name="type" value={editForm.type || ""} onChange={handleEditChange}>
                    <option value="">Select Type</option>
                    <option value="NRS">NRS</option>
                    <option value="ALL">ALL</option>
                    <option value="COMMITEE">COMMITEE</option>
                    <option value="SIDDHPUR">SIDDHPUR</option>
                  </select> : user.type || "-"}</td>
                  <td>{editUser === user.user_id ? <input name="address" value={editForm.address || ""} onChange={handleEditChange} /> : user.address || "-"}</td>
                  <td>{editUser === user.user_id ? <input name="surname" value={editForm.surname || ""} onChange={handleEditChange} /> : user.surname || "-"}</td>
                  <td>{editUser === user.user_id ? <input name="father_or_husband_name" value={editForm.father_or_husband_name || ""} onChange={handleEditChange} /> : user.father_or_husband_name || "-"}</td>
                  <td>{editUser === user.user_id ? <input name="pincode" value={editForm.pincode || ""} onChange={handleEditChange} /> : user.pincode || "-"}</td>
                  <td>{editUser === user.user_id ? <input name="state" value={editForm.state || ""} onChange={handleEditChange} /> : user.state || "-"}</td>
                  <td>{editUser === user.user_id ? <input name="usercode" value={editForm.usercode || ""} onChange={handleEditChange} /> : user.usercode || "-"}</td>
                  <td>{editUser === user.user_id ? <input name="mother_name" value={editForm.mother_name || ""} onChange={handleEditChange} /> : user.mother_name || "-"}</td>
                  <td>{editUser === user.user_id ? <input name="gender" value={editForm.gender || ""} onChange={handleEditChange} /> : user.gender || "-"}</td>
                  <td>{editUser === user.user_id ? <input type="date" name="birth_date" value={editForm.birth_date || ""} onChange={handleEditChange} /> : user.birth_date || "-"}</td>
                  <td>{editUser === user.user_id ? <input name="mobile_no1" value={editForm.mobile_no1 || ""} onChange={handleEditChange} /> : user.mobile_no1 || "-"}</td>
                  <td>{editUser === user.user_id ? <input name="mobile_no2" value={editForm.mobile_no2 || ""} onChange={handleEditChange} /> : user.mobile_no2 || "-"}</td>
                  <td>{editUser === user.user_id ? <input name="email_id" value={editForm.email_id || ""} onChange={handleEditChange} /> : user.email_id || "-"}</td>
                  <td>{editUser === user.user_id ? <input name="occupation" value={editForm.occupation || ""} onChange={handleEditChange} /> : user.occupation || "-"}</td>
                  <td>{editUser === user.user_id ? <input name="country" value={editForm.country || ""} onChange={handleEditChange} /> : user.country || "-"}</td>
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

      <div className="pagination">
        <button onClick={() => setPage(page - 1)} disabled={page <= 1}>Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}>Next</button>
      </div>
    </div>
  );
};

export default Showuser;
