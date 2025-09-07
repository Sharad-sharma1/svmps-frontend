import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URLS } from "../../../utils/fetchurl";
import { useRegularApiCall } from "../../../hooks/useApiCall";
import LoadingOverlay from "../../common/LoadingOverlay";
import Pagination from "../../common/Pagination";
import "../addarea/Area.css";

const AddVillage = () => {
  const [villages, setVillages] = useState([]);
  const [search, setSearch] = useState("");
  const [newVillage, setNewVillage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const villagesPerPage = 10;

  // API call hooks  
  const { loading: loadingVillages, error: villagesError, execute: executeVillagesCall, reset: resetVillagesCall } = useRegularApiCall();
  const { loading: actionLoading, error: actionError, execute: executeActionCall, reset: resetActionCall } = useRegularApiCall();

  const fetchVillages = async (page = 1, searchValue = "") => {
    try {
      await executeVillagesCall(
        ({ signal }) => axios.get(API_URLS.getAllVillages(), {
          params: {
            page_num: page,
            village: searchValue || undefined,
          },
          signal,
        }),
        {
          loadingMessage: "Loading villages...",
          onSuccess: (response) => {
            setVillages(response.data.data);
            setTotalCount(response.data.total_count);
          },
          onError: (error) => {
            console.error("Error fetching villages:", error);
          }
        }
      );
    } catch (err) {
      // Error handled by hook
    }
  };

  useEffect(() => {
    fetchVillages(currentPage, search);
  }, [currentPage, search]);

  const handleAddVillage = async () => {
    if (newVillage.trim()) {
      try {
        await executeActionCall(
          ({ signal }) => axios.post(API_URLS.createVillage(), {
            village: newVillage.trim(),
          }, { signal }),
          {
            loadingMessage: "Adding village...",
            onSuccess: () => {
              setNewVillage("");
              fetchVillages(currentPage, search);
            },
            onError: (error) => {
              alert(error.originalError?.response?.data?.detail || "Error adding village.");
            }
          }
        );
      } catch (err) {
        // Error handled by hook
      }
    }
  };

  const handleDeleteVillage = async (id) => {
    if (window.confirm("Are you sure you want to delete this village?")) {
      try {
        await executeActionCall(
          ({ signal }) => axios.delete(API_URLS.deleteVillage(id), { signal }),
          {
            loadingMessage: "Deleting village...",
            onSuccess: () => {
              fetchVillages(currentPage, search);
            },
            onError: (error) => {
              alert("Error deleting village.");
            }
          }
        );
      } catch (err) {
        // Error handled by hook
      }
    }
  };

  const totalPages = Math.ceil(totalCount / villagesPerPage);

  // Loading and error handlers
  const handleVillagesRetry = () => {
    resetVillagesCall();
    fetchVillages(currentPage, search);
  };

  const handleActionRetry = () => {
    resetActionCall();
  };

  return (
    <>
      <LoadingOverlay 
        isVisible={loadingVillages}
        message="Loading villages..."
      />
      <LoadingOverlay 
        isVisible={villagesError && !loadingVillages}
        message={villagesError?.message}
        isError={true}
        onRetry={villagesError?.canRetry ? handleVillagesRetry : null}
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
    </>
  );
};

export default AddVillage;
