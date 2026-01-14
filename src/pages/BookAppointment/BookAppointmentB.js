import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ShowLoader } from "../../redux/loaderSlice";
import { GetBarberById } from "../../apicalls/barbers";
import { message } from "antd";
import moment from "moment";
import {
  BookBarberAppointment,
  GetBarberAppointmentsOnDate,
} from "../../apicalls/appointments";
import emailjs from "@emailjs/browser";

function BookAppointmentB1() {
  const [service, setService] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");

  const [date, setDate] = useState("");
  const [barber, setBarber] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);

  //  SPREMEMBA (B1): pokažemo samo 3 termine naenkrat + "Show more"
  const [visibleCount, setVisibleCount] = useState(3);

  //  SPREMEMBA (B1): po izbiri termina skrijemo seznam in pokažemo samo izbran termin
  const [isChoosingSlot, setIsChoosingSlot] = useState(true);

  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const loggedUser = JSON.parse(localStorage.getItem("user"));

  const form = useRef();

  // enako kot original: če je uporabnik prijavljen, avtomatsko nastavi ime in email
  useEffect(() => {
    if (loggedUser) {
      setUserName(loggedUser.name || "");
      setEmail(loggedUser.email || "");
    }
  }, [loggedUser]);

  const sendEmail = (e) => {
    e.preventDefault();
    emailjs
      .sendForm(
        "service_qu3x28k",
        "contact_form",
        e.target,
        "LWe-UrSziUXrStoT7"
      )
      .then(
        (result) => console.log(result.text),
        (error) => console.log(error.text)
      );
    e.target.reset();
  };

  const getData = async () => {
    try {
      dispatch(ShowLoader(true));
      const response = await GetBarberById(id);

      if (response?.success) {
        if (response.data?.status !== "approved") {
          message.warning("This barber is not approved yet.");
          navigate("/");
        } else {
          setBarber(response.data);
        }
      } else {
        message.error(response?.message || "Failed to fetch barber.");
        navigate("/");
      }
      dispatch(ShowLoader(false));
    } catch (error) {
      message.error(error?.message || "Failed to fetch barber.");
      dispatch(ShowLoader(false));
      navigate("/");
    }
  };

  const getBookedSlots = async () => {
    if (!date) return;
    try {
      dispatch(ShowLoader(true));
      const response = await GetBarberAppointmentsOnDate(id, date);
      dispatch(ShowLoader(false));

      if (response?.success) {
        setBookedSlots(response.data || []);
      } else {
        message.error(response?.message || "Failed to fetch booked slots.");
      }
    } catch (error) {
      dispatch(ShowLoader(false));
      message.error(error?.message || "Failed to fetch booked slots.");
    }
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    //  SPREMEMBA proti originalu:
    // ko uporabnik spremeni datum, resetiramo izbran termin + "show more" + odpremo seznam terminov
    setSelectedSlot("");
    setVisibleCount(3);
    setIsChoosingSlot(true);
    getBookedSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const slotDuration = 30;

  const buildSlots = () => {
    if (!barber || !date) return { slots: [], available: false };

    const day = moment(date).format("dddd").toLowerCase();

    // SPREMEMBA (stabilnost): varno mapiranje dni
    const barberDays = (barber?.days || []).map((d) => (d || "").toLowerCase());

    if (!barberDays.includes(day)) {
      return { slots: [], available: false };
    }

    let startTime = moment(barber.startTime, "HH:mm");
    let endTime = moment(barber.endTime, "HH:mm");

    if (!startTime.isValid() || !endTime.isValid()) {
      return { slots: [], available: false };
    }

    const slots = [];
    while (startTime < endTime) {
      slots.push(startTime.format("HH:mm"));
      startTime.add(slotDuration, "minutes");
    }

    return { slots, available: true };
  };

  const { slots: allSlots, available } = buildSlots();
  const slotsToShow = allSlots.slice(0, visibleCount);

  const onBookAppointment = async () => {
    try {
      if (!selectedSlot || !service || !userName || !email) {
        return message.warning("Please fill all required fields");
      }

      dispatch(ShowLoader(true));

      // SPREMEMBA (stabilnost): podpiramo barber.id ali barber._id
      const payload = {
        barberId: barber?._id || barber?.id,
        userId: loggedUser?.id || loggedUser?._id,
        date,
        slot: selectedSlot,
        barberName:
          `${barber?.firstName || ""} ${barber?.lastName || ""}`.trim(),
        service,
        userName,
        email,
        phoneNumber,
        bookedOn: moment().format("DD-MM-YYYY hh:mm A"),
        description,
        status: "approved",
      };

      const response = await BookBarberAppointment(payload);

      if (response?.success) {
        message.success(response?.message || "Appointment booked!");
        navigate("/");
      } else {
        message.error(response?.message || "Booking failed.");
      }

      dispatch(ShowLoader(false));
    } catch (error) {
      message.error(error?.message || "Booking failed.");
      dispatch(ShowLoader(false));
    }
  };

  if (!barber) {
    return (
      <div className="book-b1-page">
        <div className="book-b1-container">
          <div className="book-b1-card">
            <h2 className="book-b1-loading">Loading barber...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-b1-page">
      <div className="book-b1-container">
        <div className="book-b1-card">
          <h1 className="book-b1-title">
            {barber.firstName} {barber.lastName}
          </h1>

          <hr className="book-b1-hr" />

          <div className="book-b1-info">
            <div className="k">Experience:</div>
            <div className="v">{barber.experience} Years</div>

            <div className="k">Email:</div>
            <div className="v">{barber.email}</div>

            <div className="k">Phone:</div>
            <div className="v">{barber.phone}</div>

            <div className="k">Speciality:</div>
            <div className="v uppercase">{barber.speciality}</div>

            <div className="k">Days Available:</div>
            <div className="v">{(barber.days || []).join(", ")}</div>
          </div>

          <hr className="book-b1-hr" />

          <div className="book-b1-section">
            <h3 className="book-b1-h3">Select date:</h3>
            <input
              type="date"
              className="book-b1-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={moment().format("YYYY-MM-DD")}
            />
          </div>

          {/* B1: izbira termina (3 + Show more) in po izbiri prikažemo samo izbran termin */}
          {date && (
            <div className="book-b1-section">
              <h3 className="book-b1-h3">Select time:</h3>

              {!available ? (
                <div className="book-b1-note">
                  Barber is not available on {moment(date).format("DD-MM-YYYY")}
                </div>
              ) : (
                <>
                  {isChoosingSlot ? (
                    <>
                      <div className="book-b1-slots">
                        {slotsToShow.map((slot) => {
                          const isBooked = (bookedSlots || []).find(
                            (b) => b?.slot === slot && b?.status !== "cancelled"
                          );

                          const label = `${moment(slot, "HH:mm").format(
                            "hh:mm A"
                          )} - ${moment(slot, "HH:mm")
                            .add(slotDuration, "minutes")
                            .format("hh:mm A")}`;

                          return (
                            <label
                              key={slot}
                              className={`book-b1-slot ${
                                isBooked ? "is-booked" : ""
                              } ${selectedSlot === slot ? "is-selected" : ""}`}
                            >
                              <div className="book-b1-slot-left">
                                <input
                                  className="book-b1-radio"
                                  type="radio"
                                  name="slot"
                                  value={slot}
                                  disabled={!!isBooked}
                                  checked={selectedSlot === slot}
                                  onChange={() => {
                                    // po izbiri skrijemo seznam in pokažemo izbran termin
                                    setSelectedSlot(slot);
                                    setIsChoosingSlot(false);
                                  }}
                                />
                                <span className="book-b1-slot-text">
                                  {label}
                                </span>
                              </div>

                              {isBooked && (
                                <span className="book-b1-badge">Booked</span>
                              )}
                            </label>
                          );
                        })}
                      </div>

                      {visibleCount < allSlots.length && (
                        <button
                          type="button"
                          className="contained-btn my-2"
                          onClick={() => setVisibleCount((v) => v + 3)} // dodajamo po 3
                        >
                          Show more
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="book-b1-selected-wrap">
                      <div className="book-b1-note">
                        Selected time:{" "}
                        <b>
                          {moment(selectedSlot, "HH:mm").format("hh:mm A")} -{" "}
                          {moment(selectedSlot, "HH:mm")
                            .add(slotDuration, "minutes")
                            .format("hh:mm A")}
                        </b>
                      </div>

                      <button
                        type="button"
                        className="contained-btn my-2"
                        onClick={() => {
                          // ko želi spremeniti termin, odpremo seznam
                          setIsChoosingSlot(true);
                          setVisibleCount(3); // opcijsko: spet pokaži samo prve 3
                        }}
                      >
                        Change time
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {selectedSlot && (
            <form
              className="bookBarb book-b1-form my-3 mx-auto"
              ref={form}
              onSubmit={sendEmail}
            >
              {/* hidden polja za emailjs */}
              <input
                type="text"
                className="none"
                name="barber"
                value={barber.firstName + " " + barber.lastName}
                readOnly
              />
              <input
                type="text"
                className="none"
                name="date"
                value={date}
                readOnly
              />
              <input
                type="text"
                className="none"
                name="selectedSlot"
                value={selectedSlot}
                readOnly
              />

              <hr className="book-b1-hr" />

              <label>Service:</label>
              <select
                className="book-b1-input"
                name="service"
                id="service"
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                <option value=""></option>
                {(barber.services || []).length > 0 ? (
                  barber.services.map((serv) => (
                    <option key={serv.service} value={serv.service}>
                      {serv.service} ({serv.price}€)
                    </option>
                  ))
                ) : (
                  <option disabled>No services available</option>
                )}
              </select>

              <label>Name:</label>
              <input
                className="book-b1-input"
                type="text"
                value={userName}
                name="userName"
                onChange={(e) => setUserName(e.target.value)}
              />

              <label>Email:</label>
              <input
                className="book-b1-input"
                type="text"
                value={email}
                name="email"
                onChange={(e) => setEmail(e.target.value)}
              />

              <label>Phone Number:</label>
              <input
                className="book-b1-input"
                type="number"
                value={phoneNumber}
                name="phoneNumber"
                onChange={(e) => setPhoneNumber(e.target.value)}
              />

              <label>Message:</label>
              <textarea
                className="book-b1-input"
                placeholder="What do you need?"
                value={description}
                name="message"
                onChange={(e) => setDescription(e.target.value)}
                rows="6"
              ></textarea>

              <input
                className="contained-btn my-2"
                type="submit"
                value="Book Appointment"
                onClick={onBookAppointment}
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookAppointmentB1;
