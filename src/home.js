import React, { useState } from "react";
import "./App.css";

const MOCK_STUDENTS = {
  4471911: { name: "Alice", department: "Computer Science" },
  4471922: { name: "Bob", department: "Mechanical Engineering" },
  4471933: { name: "Charlie", department: "Electrical Engineering" },
  4471944: { name: "Diana", department: "Information Technology" },
  4471955: { name: "Ethan", department: "Civil Engineering" },
  4471966: { name: "Fiona", department: "Chemical Engineering" },
  4471977: { name: "Hazel", department: "Biotechnology" },
  4471988: { name: "Karel", department: "Electronics" },
};

const Home = () => {
  const [scannedBy, setScannedBy] = useState("Discussion");
  const [otherPurpose, setOtherPurpose] = useState("");
  const [hostId, setHostId] = useState("");
  const [groupMembers, setGroupMembers] = useState(["", ""]);
  const [timeDuration, setTimeDuration] = useState("1.5 hours");
  const [studentStatus, setStudentStatus] = useState(new Map());
  const [totalScanCount, setTotalScanCount] = useState(0);
  const [rows, setRows] = useState([]);

  const handleGroupMemberChange = (index, value) => {
    const updated = [...groupMembers];
    updated[index] = value;
    setGroupMembers(updated);
  };

  const handleAddMember = () => {
    setGroupMembers([...groupMembers, ""]);
  };

  const handleSubmit = () => {
    const allIds = [hostId.trim(), ...groupMembers.map((id) => id.trim())];

    if (!hostId.trim()) {
      alert("Host Student ID is required.");
      return;
    }

    const invalidIds = allIds.filter(
      (id) => !/^\d{7}$/.test(id) || !MOCK_STUDENTS[id]
    );

    if (invalidIds.length > 0) {
      alert(
        `Invalid student ID(s): ${invalidIds.join(
          ", "
        )}.\nMake sure each ID is 7 digits and valid.`
      );
      return;
    }

    if (!scannedBy || (scannedBy === "Others" && !otherPurpose.trim())) {
      alert("Please enter the purpose.");
      return;
    }

    const purposeToUse =
      scannedBy === "Others" ? otherPurpose.trim() : scannedBy;

    const unavailableSeats = Array.from(studentStatus.values()).filter(
      (s) => s.status === "in"
    ).length;
    const seatsLeft = 12 - unavailableSeats;

    if (allIds.length > seatsLeft) {
      alert(`Only ${seatsLeft} seats left. Please reduce your group size.`);
      return;
    }

    const now = new Date();
    const formattedTime = now.toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour12: true,
    });

    const currentStatus = new Map(studentStatus);
    const newRows = [];

    allIds.forEach((id) => {
      const existing = currentStatus.get(id);
      let status = "";
      let seatIndex = null;

      if (!existing || existing.status === "out") {
        seatIndex = Array.from({ length: 12 }, (_, i) => i).find(
          (i) =>
            ![...currentStatus.values()].some(
              (v) => v.status === "in" && v.seatIndex === i
            )
        );

        currentStatus.set(id, {
          seatIndex,
          status: "in",
          purpose: purposeToUse,
          timeDuration,
        });

        status = "In";

        newRows.push({
          id: totalScanCount + newRows.length + 1,
          studentId: id,
          purpose: purposeToUse,
          status,
          time: formattedTime,
          timeDuration,
        });
      } else {
        currentStatus.set(id, {
          ...existing,
          status: "out",
        });

        seatIndex = existing.seatIndex;
        status = "Out";

        newRows.push({
          id: totalScanCount + newRows.length + 1,
          studentId: id,
          purpose: existing.purpose,
          status,
          time: formattedTime,
          timeDuration: existing.timeDuration,
        });
      }
    });

    setStudentStatus(currentStatus);
    setTotalScanCount(totalScanCount + newRows.length);
    setRows([...rows, ...newRows]);

    setHostId("");
    setGroupMembers(["", ""]);
    setTimeDuration("1.5 hours");
    if (scannedBy === "Others") setOtherPurpose("");
  };

  const seatStatuses = Array.from({ length: 12 }, (_, i) => {
    const entry = [...studentStatus.entries()].find(
      ([, val]) => val.status === "in" && val.seatIndex === i
    );
    return entry ? "in" : null;
  });

  const allIdsForDisplay = [hostId, ...groupMembers].filter(
    (id) => id.trim() !== ""
  );

  return (
    <div>
      <div className="card-container">
        <div className="left-panel">
          <div className="overlay"></div>
          <h1>📓 VESASC Library</h1>
          <p>
            Book smarter. Collaborate better. Track your discussion room with
            ease.
          </p>
        </div>

        <div className="right-panel">
          <h2>Discussion Room Booking</h2>

          <div className="form-group">
            <label htmlFor="scannedBy">Purpose:</label>
            <select
              id="scannedBy"
              value={scannedBy}
              onChange={(e) => {
                setScannedBy(e.target.value);
                if (e.target.value !== "Others") setOtherPurpose("");
              }}
            >
              <option value="Discussion">Discussion</option>
              <option value="Study">Study</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {scannedBy === "Others" && (
            <div className="form-group">
              <label htmlFor="otherPurpose">Please specify:</label>
              <input
                type="text"
                id="otherPurpose"
                value={otherPurpose}
                onChange={(e) => setOtherPurpose(e.target.value)}
                placeholder="Specify other purpose"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="hostId">Host Student ID</label>
            <input
              type="text"
              id="hostId"
              placeholder="Enter Host ID"
              value={hostId}
              maxLength={7}
              onChange={(e) => setHostId(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Group Member IDs</label>
            {groupMembers.map((member, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Member ${index + 1}`}
                value={member}
                maxLength={7}
                onChange={(e) => handleGroupMemberChange(index, e.target.value)}
              />
            ))}
            <div className="add-member" onClick={handleAddMember}>
              + Add Member
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="timeDuration">Time Duration:</label>
            <select
              id="timeDuration"
              value={timeDuration}
              onChange={(e) => setTimeDuration(e.target.value)}
            >
              <option value="1.5 hours">1.5 hours</option>
              <option value="0.5 hours">Half hour</option>
              <option value="1 hour">1 hour</option>
            </select>
          </div>

          <div className="form-group">
            <label>Seats Availability:</label>
            <div className="seat-boxes">
              {seatStatuses.map((status, i) => (
                <div
                  key={i}
                  className={`seat ${
                    status === "in"
                      ? "occupied"
                      : status === "out"
                      ? "exited"
                      : ""
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {allIdsForDisplay.length > 0 && (
            <div className="form-group">
              <label>Student Details:</label>
              {allIdsForDisplay.map((id, idx) => {
                const student = MOCK_STUDENTS[id];
                return student ? (
                  <div key={idx} className="student-info">
                    <strong>{student.name}</strong> — {student.department} (ID:{" "}
                    {id})
                  </div>
                ) : (
                  <div key={idx} className="student-info invalid">
                    Invalid ID: {id}
                  </div>
                );
              })}
            </div>
          )}

          <button onClick={handleSubmit}>Book now</button>
        </div>
      </div>
    </div>
  );
};

export default Home;