import React, {useState, useEffect} from "react";
import axiosInstance from "../api/axiosInstance";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./Header";
import {useNavigate} from "react-router-dom";

const BookingForm = () => {
  const today = new Date().toISOString().split("T")[0];
  const [seats, setSeats] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  //   console.log(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedSeat, setSelectedSeat] = useState(null);

  const navigate = useNavigate();

  // checking the authuser in localstorage to prevent from login page and fetching api to list seats
  useEffect(() => {
    console.log("Enter to useEffect");
    const userData = localStorage.getItem("userData");
    if (userData === null) {
      navigate("/login");
    }

    const fetchSeats = async () => {
      try {
        const response = await axiosInstance.get(
          `hall/list-seats/?date=${selectedDate}`
        );
        setSeats(response.data);
      } catch (error) {
        console.error("Error fetching seats:", error);
      }
    };

    if (selectedDate) {
      fetchSeats();
    }
  }, [selectedDate, navigate]);

  // handling selectedDate to fetch seats and seats data with selected date
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;

    // preventing user to select date before today
    if (selectedDate < today) {
      toast.error("Please select a date starting from today.");
      return;
    }

    setSelectedDate(selectedDate);
  };

  // handling selected seats to identify the user to which seat and to get seatId for booking
  const handleSeatClick = (seatId) => {
    setSelectedSeat(seatId);
  };

  // handle the booking with validation if validation corrects post userdata, date and seat to booking api
  const handleBook = async () => {
    if (!name || !phoneNumber || phoneNumber.length !== 10) {
      toast.error("Please fill in your name and 10 digit phonenumber!");
      return;
    }

    try {
      const response = await axiosInstance.post("hall/bookings/", {
        seat: selectedSeat,
        booking_date: selectedDate,
        name,
        phone_number: phoneNumber,
      });
      console.log("Booking response:", response.data);
      setSeats((prevSeats) =>
        prevSeats.map((seat) =>
          seat.id === selectedSeat ? {...seat, is_booked: true} : seat
        )
      );
      setSelectedSeat(null);
      setName("");
      setPhoneNumber("");
      toast.success("Your seat has been booked successfully!");
    } catch (error) {
      console.error("Error booking seat:", error);
      toast.error("Booking failed. This seat might already be booked.");
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <div className="container mx-auto p-2 md:max-w-screen-md md:p-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="date"
          >
            Select Date
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="border rounded-md px-3 py-2 w-full"
          />
        </div>
        {selectedDate && (
          <div className="container mx-auto md:max-w-screen-md md:p-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Seat
            </label>
            <div className="container mx-auto p-2 md:max-w-screen-md md:p-4 grid grid-cols-10 md:gap-4 sm:gap-1">
              {seats.map((seat) => (
                <button
                  key={seat.id}
                  className={`h-12 border rounded shadow-sm sm:px-4 py-1 ${
                    seat.is_booked
                      ? "bg-red-500 cursor-not-allowed"
                      : "bg-green-500 "
                  } text-white ${
                    selectedSeat === seat.id ? "bg-blue-900" : ""
                  }`}
                  onClick={() => !seat.is_booked && handleSeatClick(seat.id)}
                  disabled={seat.is_booked}
                >
                  {seat.number}
                </button>
              ))}
            </div>
          </div>
        )}
        {selectedSeat && (
          <div className="container mx-auto p-2 md:max-w-screen-md md:p-5 rounded-md bg-white shadow-md">
            <div className="mb-3">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="name"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border rounded-md px-3 py-2 w-full"
                min={today}
                placeholder="Enter your Name"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="phoneNumber"
              >
                Phone Number
              </label>
              <input
                type="number"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="border rounded-md px-3 py-2 w-full"
                placeholder="Enter 10 digit phone-number"
              />
            </div>
            <button
              className="bg-violet-600 text-white py-2 px-4 rounded-md hover:bg-violet-800 transition duration-200"
              onClick={handleBook}
            >
              Book Seat
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default BookingForm;
