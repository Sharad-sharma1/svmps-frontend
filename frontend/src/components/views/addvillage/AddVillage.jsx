import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URLS } from "../../../utils/fetchurl";
import Pagination from "../../common/Pagination";
import "../addarea/Area.css";

const AddVillage = () => {
  const [villages, setVillages] = useState([]);
  const [search, setSearch] = useState("");
  const [newVillage, setNewVillage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const villagesPerPage = 10;

  const fetchVillages = async (page = 1, searchValue = "") => {
    try {
      const response = await axios.get(API_URLS.getAllVillages(), {
        params: {
          page_num: page,
          village: searchValue || undefined,
        },
      });
      setVillages(response.data.data);
      setTotalCount(response.data.total_count);
    } catch (error) {
      console.error("Error fetching villages:", error);
    }
  };

  useEffect(() => {
    fetchVillages(currentPage, search);
  }, [currentPage, search]);

  const handleAddVillage = async () => {
    if (newVillage.trim()) {
      try {
        await axios.post(API_URLS.createVillage(), {
          village: newVillage.trim(),
        });
        setNewVillage("");
        fetchVillages(currentPage, search);
      } catch (error) {
        alert(error.response?.data?.detail || "Error adding village.");
      }
    }
  };

  const handleDeleteVillage = async (id) => {
    try {
      await axios.delete(API_URLS.deleteVillage(id));
      fetchVillages(currentPage, search);
    } catch (error) {
      alert("Error deleting village.");
    }
  };

  const totalPages = Math.ceil(totalCount / villagesPerPage);

  return (
    <div className="addarea-container">
      {/* Left - Add Village */}
      <div className="addarea-left">
        <h2>Add Village</h2>
        <input
          type="text"
          value={newVillage}
          onChange={(e) => setNewVillage(e.target.value)}
          placeholder="Enter village name"
        />
        <button onClick={handleAddVillage}>Add</button>
      </div>

      {/* Right - Show/Search Villages */}
      <div className="addarea-right">
        <h2>Village List</h2>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search villages"
        />

        <ul className="area-list">
          {villages.length > 0 ? (
            villages.map((village) => (
              <li key={village.village_id} className="area-item">
                {village.village} - {village.user_count}
                <button
                  className="delete-button"
                  onClick={() => handleDeleteVillage(village.village_id)}
                >
                  ×
                </button>
              </li>
            ))
          ) : (
            <p>No villages found.</p>
          )}
        </ul>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default AddVillage;
