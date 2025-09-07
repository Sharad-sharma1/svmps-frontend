import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URLS } from "../../../utils/fetchurl";
import { useRegularApiCall } from "../../../hooks/useApiCall";
import LoadingOverlay from "../../common/LoadingOverlay";
import Pagination from "../../common/Pagination";
import "./Area.css";

const AddArea = () => {
  const [areas, setAreas] = useState([]);
  const [search, setSearch] = useState("");
  const [newArea, setNewArea] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const areasPerPage = 10;

  // API call hooks
  const { loading: loadingAreas, error: areasError, execute: executeAreasCall, reset: resetAreasCall } = useRegularApiCall();
  const { loading: actionLoading, error: actionError, execute: executeActionCall, reset: resetActionCall } = useRegularApiCall();

  const fetchAreas = async (page = 1, searchValue = "") => {
    try {
      await executeAreasCall(
        ({ signal }) => axios.get(API_URLS.getAllAreas(), {
          params: {
            page_num: page,
            area: searchValue || undefined,
          },
          signal,
        }),
        {
          loadingMessage: "Loading areas...",
          onSuccess: (response) => {
            setAreas(response.data.data);
            setTotalCount(response.data.total_count);
          },
          onError: (error) => {
            console.error("Error fetching areas:", error);
          }
        }
      );
    } catch (err) {
      // Error handled by hook
    }
  };

  useEffect(() => {
    fetchAreas(currentPage, search);
  }, [currentPage, search]);

  const handleAddArea = async () => {
    if (newArea.trim()) {
      try {
        await executeActionCall(
          ({ signal }) => axios.post(API_URLS.createArea(), {
            area: newArea.trim(),
          }, { signal }),
          {
            loadingMessage: "Adding area...",
            onSuccess: () => {
              setNewArea("");
              fetchAreas(currentPage, search);
            },
            onError: (error) => {
              alert(error.originalError?.response?.data?.detail || "Error adding area.");
            }
          }
        );
      } catch (err) {
        // Error handled by hook
      }
    }
  };

  const handleDeleteArea = async (id) => {
    if (window.confirm("Are you sure you want to delete this area?")) {
      try {
        await executeActionCall(
          ({ signal }) => axios.delete(API_URLS.deleteArea(id), { signal }),
          {
            loadingMessage: "Deleting area...",
            onSuccess: () => {
              fetchAreas(currentPage, search);
            },
            onError: (error) => {
              alert("Error deleting area.");
            }
          }
        );
      } catch (err) {
        // Error handled by hook
      }
    }
  };

  const totalPages = Math.ceil(totalCount / areasPerPage);

  // Loading and error handlers
  const handleAreasRetry = () => {
    resetAreasCall();
    fetchAreas(currentPage, search);
  };

  const handleActionRetry = () => {
    resetActionCall();
  };

  return (
    <>
      <LoadingOverlay 
        isVisible={loadingAreas}
        message="Loading areas..."
      />
      <LoadingOverlay 
        isVisible={areasError && !loadingAreas}
        message={areasError?.message}
        isError={true}
        onRetry={areasError?.canRetry ? handleAreasRetry : null}
      />
      <LoadingOverlay 
        isVisible={actionLoading}
        message="Processing..."
      />
      <LoadingOverlay 
        isVisible={actionError && !actionLoading}
        message={actionError?.message}
        isError={true}
        onRetry={actionError?.canRetry ? handleActionRetry : null}
      />

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
    </>
  );
};

export default AddArea;
