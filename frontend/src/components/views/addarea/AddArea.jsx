import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URLS } from "../../../utils/fetchurl";
import Pagination from "../../common/Pagination";
import "./Area.css";

const AddArea = () => {
  const [areas, setAreas] = useState([]);
  const [search, setSearch] = useState("");
  const [newArea, setNewArea] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const areasPerPage = 10;

  const fetchAreas = async (page = 1, searchValue = "") => {
    try {
      const response = await axios.get(API_URLS.getAllAreas(), {
        params: {
          page_num: page,
          area: searchValue || undefined,
        },
      });
      setAreas(response.data.data);
      setTotalCount(response.data.total_count);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  useEffect(() => {
    fetchAreas(currentPage, search);
  }, [currentPage, search]);

  const handleAddArea = async () => {
    if (newArea.trim()) {
      try {
        await axios.post(API_URLS.createArea(), {
          area: newArea.trim(),
        });
        setNewArea("");
        fetchAreas(currentPage, search);
      } catch (error) {
        alert(error.response?.data?.detail || "Error adding area.");
      }
    }
  };

  const handleDeleteArea = async (id) => {
    try {
      await axios.delete(API_URLS.deleteArea(id));
      fetchAreas(currentPage, search);
    } catch (error) {
      alert("Error deleting area.");
    }
  };

  const totalPages = Math.ceil(totalCount / areasPerPage);

  return (
    <div className="addarea-container">
      {/* Left - Add Area */}
      <div className="addarea-left">
        <h2>Add Area</h2>
        <input
          type="text"
          value={newArea}
          onChange={(e) => setNewArea(e.target.value)}
          placeholder="Enter area name"
        />
        <button onClick={handleAddArea}>Add</button>
      </div>

      {/* Right - Show/Search Areas */}
      <div className="addarea-right">
        <h2>Area List</h2>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search areas"
        />

        <ul className="area-list">
          {areas.length > 0 ? (
            areas.map((area) => (
              <li key={area.area_id} className="area-item">
                {area.area} - {area.user_count}
                <button
                  className="delete-button"
                  onClick={() => handleDeleteArea(area.area_id)}
                >
                  ×
                </button>
              </li>
            ))
          ) : (
            <p>No areas found.</p>
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

export default AddArea;
