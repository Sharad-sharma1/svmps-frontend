import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import "./Showuser.css";

const Showuser = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchUsers = async (pageNum = 1, search = "") => {
    try {
      const response = await axios.get(`https://svmps-frontend.onrender.com/users/?page_num=${pageNum}&name=${search}`);
      setUsers(response.data.data);
      setTotalCount(response.data.total_count);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      setPage(1);
      fetchUsers(1, value);
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  useEffect(() => {
    fetchUsers(page, searchTerm);
  }, [page, searchTerm]);

  const handleDelete = async (id) => {
  try {
    await axios.delete(`https://svmps-frontend.onrender.com/users/${id}`);
    window.alert("✅ User deleted successfully.");
    fetchUsers(page, searchTerm);
  } catch (err) {
    console.error("Error deleting user:", err);
    window.alert("❌ Failed to delete user.");
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
  const cleanEditForm = Object.fromEntries(
    Object.entries(editForm).filter(([_, val]) => val !== "")
  );
  console.log("📦 Final cleaned payload:", cleanEditForm);
  try {
    await axios.put(`https://svmps-frontend.onrender.com/users/${editUser}`, cleanEditForm);
    window.alert("✅ User updated successfully.");
    setEditUser(null);
    fetchUsers(page, searchTerm);
  } catch (err) {
    console.error("❌ Failed to update user:", err.response?.data || err);
    window.alert("❌ Failed to update user.");
  }
};

  const totalPages = Math.ceil(totalCount / 10);

  return (
    <div className="show-user-container">
      <h2>User List</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User Code</th>
              <th>Name</th>
              <th>Surname</th>
              <th>Father/Husband</th>
              <th>Mother</th>
              <th>Gender</th>
              <th>Birth Date</th>
              <th>Mobile 1</th>
              <th>Mobile 2</th>
              <th>Email</th>
              <th>Occupation</th>
              <th>Address</th>
              <th>Pincode</th>
              <th>Country</th>
              <th>State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length ? (
              users.map(user => (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  <td>
                    {editUser === user.user_id ? (
                      <input name="usercode" value={editForm.usercode || ""} onChange={handleEditChange} />
                    ) : user.usercode || "-"}
                  </td>
                  <td>
                    {editUser === user.user_id ? (
                      <input name="name" value={editForm.name || ""} onChange={handleEditChange} />
                    ) : user.name || "-"}
                  </td>
                  <td>
                    {editUser === user.user_id ? (
                      <input name="surname" value={editForm.surname || ""} onChange={handleEditChange} />
                    ) : user.surname || "-"}
                  </td>
                  <td>
                    {editUser === user.user_id ? (
                      <input name="father_or_husband_name" value={editForm.father_or_husband_name || ""} onChange={handleEditChange} />
                    ) : user.father_or_husband_name || "-"}
                  </td>
                  <td>
                    {editUser === user.user_id ? (
                      <input name="mother_name" value={editForm.mother_name || ""} onChange={handleEditChange} />
                    ) : user.mother_name || "-"}
                  </td>
                  <td>
                    {editUser === user.user_id ? (
                      <input name="gender" value={editForm.gender || ""} onChange={handleEditChange} />
                    ) : user.gender || "-"}
                  </td>
                  <td>
                    {editUser === user.user_id ? (
                      <input type="date" name="birth_date" value={editForm.birth_date || ""} onChange={handleEditChange} />
                    ) : user.birth_date || "-"}
                  </td>
                  <td>
                    {editUser === user.user_id ? (
                      <input name="mobile_no1" value={editForm.mobile_no1 || ""} onChange={handleEditChange} />
                    ) : user.mobile_no1 || "-"}
                  </td>
                  <td>
                    {editUser === user.user_id ? (
                      <input name="mobile_no2" value={editForm.mobile_no2 || ""} onChange={handleEditChange} />
                    ) : user.mobile_no2 || "-"}
                  </td>
                  <td>
                    {editUser === user.user_id ? (
                      <input name="email_id" value={editForm.email_id || ""} onChange={handleEditChange} />
                    ) : user.email_id || "-"}
                  </td>
                  <td>
                    {editUser === user.user_id ? (
                      <input name="occupation" value={editForm.occupation || ""} onChange={handleEditChange} />
                    ) : user.occupation || "-"}
                  </td>
                  <td>
                    {editUser === user.user_id ? (
                      <input name="address" value={editForm.address || ""} onChange={handleEditChange} />
                    ) : user.address || "-"}
                  </td>
                  <td>
                    {editUser === user.user_id ? (
                      <input name="pincode" value={editForm.pincode || ""} onChange={handleEditChange} />
                    ) : user.pincode || "-"}
                  </td>
                  <td>
                    {editUser === user.user_id ? (
                      <input name="country" value={editForm.country || ""} onChange={handleEditChange} />
                    ) : user.country || "-"}
                  </td>
                  <td>
                    {editUser === user.user_id ? (
                      <input name="state" value={editForm.state || ""} onChange={handleEditChange} />
                    ) : user.state || "-"}
                  </td>
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="17" className="no-data">No users found</td>
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
