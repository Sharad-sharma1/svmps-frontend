import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import "./Showuser.css";

const Showuser = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [villages, setVillages] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const usersPerPage = 10;

  const fetchUsers = async () => {
    try {
      const response = await axios.get("https://svmps-frontend.onrender.com/users/");
      setUsers(response.data.data);
      setFilteredUsers(response.data.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchAreaAndVillage = async () => {
    try {
      const [areaRes, villageRes] = await Promise.all([
        axios.get("https://svmps-frontend.onrender.com/area/"),
        axios.get("https://svmps-frontend.onrender.com/village/"),
      ]);
      setAreas(areaRes.data.data);
      setVillages(villageRes.data.data);
    } catch (err) {
      console.error("Failed to fetch area/village:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAreaAndVillage();
  }, []);

  const debouncedSearch = useCallback(
    debounce((value) => {
      const term = value.toLowerCase();
      const filtered = users.filter((user) => {
        return (
          (user.name && user.name.toLowerCase().includes(term)) ||
          (user.area && user.area.toLowerCase().includes(term)) ||
          (user.village && user.village.toLowerCase().includes(term))
        );
      });
      setFilteredUsers(filtered);
      setPage(1);
    }, 300),
    [users]
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://svmps-frontend.onrender.com/users/${id}`);
      window.alert("✅ User deleted successfully.");
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      window.alert("❌ Failed to delete user.");
    }
  };

  const handleEditClick = (user) => {
    setEditUser(user.user_id);
    setEditForm({
      ...user,
      fk_area_id: user.fk_area_id || "",
      fk_village_id: user.fk_village_id || "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    const cleanEditForm = Object.fromEntries(
      Object.entries(editForm).filter(([_, val]) => val !== "")
    );
    try {
      await axios.put(`https://svmps-frontend.onrender.com/users/${editUser}`, cleanEditForm);
      window.alert("✅ User updated successfully.");
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      console.error("❌ Failed to update user:", err.response?.data || err);
      window.alert("❌ Failed to update user.");
    }
  };

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice((page - 1) * usersPerPage, page * usersPerPage);

  return (
    <div className="show-user-container">
      <h2>User List</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, area or village..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Actions</th>
              <th>ID</th>
              <th>Name</th>
              <th>Surname</th>
              <th>Father/Husband</th>
              <th>Address</th>
              <th>Pincode</th>
              <th>State</th>
              <th>Area</th>
              <th>Village</th>
              <th>Status</th>
              <th>Type</th>
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
            {paginatedUsers.length ? (
              paginatedUsers.map((user) => (
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
                  <td>{editUser === user.user_id ? <input name="surname" value={editForm.surname || ""} onChange={handleEditChange} /> : user.surname || "-"}</td>
                  <td>{editUser === user.user_id ? <input name="father_or_husband_name" value={editForm.father_or_husband_name || ""} onChange={handleEditChange} /> : user.father_or_husband_name || "-"}</td>
                  <td>{editUser === user.user_id ? <input name="address" value={editForm.address || ""} onChange={handleEditChange} /> : user.address || "-"}</td>
                  <td>{editUser === user.user_id ? <input name="pincode" value={editForm.pincode || ""} onChange={handleEditChange} /> : user.pincode || "-"}</td>
                  <td>{editUser === user.user_id ? <input name="state" value={editForm.state || ""} onChange={handleEditChange} /> : user.state || "-"}</td>

                  <td>
                    {editUser === user.user_id ? (
                      <select name="fk_area_id" value={editForm.fk_area_id || ""} onChange={handleEditChange}>
                        <option value="">Select Area</option>
                        {areas.map((a) => (
                          <option key={a.area_id} value={a.area_id}>{a.area}</option>
                        ))}
                      </select>
                    ) : user.area || "-"}
                  </td>

                  <td>
                    {editUser === user.user_id ? (
                      <select name="fk_village_id" value={editForm.fk_village_id || ""} onChange={handleEditChange}>
                        <option value="">Select Village</option>
                        {villages.map((v) => (
                          <option key={v.village_id} value={v.village_id}>{v.village}</option>
                        ))}
                      </select>
                    ) : user.village || "-"}
                  </td>

                  <td>{editUser === user.user_id ? <input name="status" value={editForm.status || ""} onChange={handleEditChange} /> : user.status || "-"}</td>
                  <td>{editUser === user.user_id ? <input name="type" value={editForm.type || ""} onChange={handleEditChange} /> : user.type || "-"}</td>
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
