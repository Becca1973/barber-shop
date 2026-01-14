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

function BookAppointmentB2() {
  const [service, setService] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");

  const [date, setDate] = useState("");
  const [barber, setBarber] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);

  // SPREMEMBA (B2) -> dodan stteper, da vidimo v katerem koraku smo pri rezervaciji
  const [step, setStep] = useState(0);

  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const loggedUser = JSON.parse(localStorage.getItem("user"));
  const form = useRef();

  const slotDuration = 30;

  useEffect(() => {
    if (loggedUser) {
      setUserName(loggedUser.name || "");
      setEmail(loggedUser.email || "");
    }
  }, [loggedUser]);

  const shouldShowNameEmailInputs =
    !(loggedUser?.name && loggedUser?.email) || !userName || !email;

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
    if (!date) return;
    setSelectedSlot("");
    getBookedSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const buildSlots = () => {
    if (!barber || !date) return { slots: [], available: false };

    const day = moment(date).format("dddd").toLowerCase();
    const barberDays = (barber?.days || []).map((d) => (d || "").toLowerCase());
    if (!barberDays.includes(day)) return { slots: [], available: false };

    let startTime = moment(barber.startTime, "HH:mm");
    let endTime = moment(barber.endTime, "HH:mm");
    if (!startTime.isValid() || !endTime.isValid())
      return { slots: [], available: false };

    const slots = [];
    while (startTime < endTime) {
      slots.push(startTime.format("HH:mm"));
      startTime.add(slotDuration, "minutes");
    }

    return { slots, available: true };
  };

  const { slots: allSlots, available } = buildSlots();

  const selectedSlotLabel =
    selectedSlot &&
    `${moment(selectedSlot, "HH:mm").format("hh:mm A")} - ${moment(
      selectedSlot,
      "HH:mm"
    )
      .add(slotDuration, "minutes")
      .format("hh:mm A")}`;

  const canGoNext = () => {
    if (step === 0) return !!date;
    if (step === 1) return !!selectedSlot;
    if (step === 2) return !!service && !!userName && !!email;
    return true;
  };

  const next = () => {
    if (!canGoNext()) {
      if (step === 0) return message.warning("Please select a date");
      if (step === 1) return message.warning("Please select a time");
      if (step === 2) return message.warning("Please fill required fields");
      return;
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onBookAppointment = async () => {
    try {
      if (!selectedSlot || !service || !userName || !email || !date) {
        return message.warning("Please fill all required fields");
      }

      dispatch(ShowLoader(true));

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
  // SPREMEMBA (B2) ->Koraki stepperja
  const StepIndicator = () => {
    const items = ["Date", "Time", "Details", "Review"];
    return (
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginTop: 10,
          marginBottom: 14,
        }}
      >
        {items.map((label, idx) => (
          <div
            key={label}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid #bbb",
              fontSize: 13,
              fontWeight: idx === step ? 700 : 600,
              opacity: idx <= step ? 1 : 0.5,
              background: idx === step ? "#fff" : "transparent",
            }}
          >
            {idx + 1}. {label}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="book-b1-page">
      <div className="book-b1-container">
        <div className="book-b1-card">
          <h1 className="book-b1-title">
            {barber.firstName} {barber.lastName}
          </h1>

          <StepIndicator />

          <hr className="book-b1-hr" />

          {/* STEP 0 */}
          {step === 0 && (
            <>
              <div className="book-b1-info">
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
            </>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="book-b1-section">
              <h3 className="book-b1-h3">Select time:</h3>

              {!date ? (
                <div className="book-b1-note">Please select a date first.</div>
              ) : !available ? (
                <div className="book-b1-note">
                  Barber is not available on {moment(date).format("DD-MM-YYYY")}
                </div>
              ) : (
                <>
                  {/* dodan prostor spodaj, da se ne dotika scrollerja */}
                  <div
                    className="flex gap-2 scroll-horizontal"
                    style={{
                      marginTop: 8,
                      paddingBottom: 10, //  prostor pod elementi
                      marginBottom: 10, //  prostor do naslednjih elementov
                    }}
                  >
                    {allSlots.map((slot) => {
                      const isBooked = (bookedSlots || []).find(
                        (b) => b?.slot === slot && b?.status !== "cancelled"
                      );

                      const label = `${moment(slot, "HH:mm").format(
                        "hh:mm A"
                      )} - ${moment(slot, "HH:mm")
                        .add(slotDuration, "minutes")
                        .format("hh:mm A")}`;

                      return (
                        <div key={slot}>
                          <div
                            className="bg-white rounded p-1 w-100 text-center"
                            onClick={() => !isBooked && setSelectedSlot(slot)}
                            style={{
                              border:
                                selectedSlot === slot
                                  ? "3px solid green"
                                  : "3px solid gray",
                              backgroundColor: isBooked ? "#d6d6d6" : "white",
                              pointerEvents: isBooked ? "none" : "auto",
                              cursor: isBooked ? "not-allowed" : "pointer",
                              minWidth: 170,
                              boxSizing: "border-box",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span
                              style={{ fontSize: 13, whiteSpace: "nowrap" }}
                            >
                              {label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedSlot && (
                    <div className="book-b1-note" style={{ marginTop: 6 }}>
                      Selected time: <b>{selectedSlotLabel}</b>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="book-b1-section">
              <form
                className="bookBarb book-b1-form"
                ref={form}
                onSubmit={sendEmail}
              >
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

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div>
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
                  </div>

                  {shouldShowNameEmailInputs && (
                    <>
                      <div>
                        <label>Name:</label>
                        <input
                          className="book-b1-input"
                          type="text"
                          value={userName}
                          name="userName"
                          onChange={(e) => setUserName(e.target.value)}
                        />
                      </div>

                      <div>
                        <label>Email:</label>
                        <input
                          className="book-b1-input"
                          type="text"
                          value={email}
                          name="email"
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label>Phone Number:</label>
                    <input
                      className="book-b1-input"
                      type="number"
                      value={phoneNumber}
                      name="phoneNumber"
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>

                  <div>
                    <label>Message:</label>
                    <textarea
                      className="book-b1-input"
                      placeholder="What do you need?"
                      value={description}
                      name="message"
                      onChange={(e) => setDescription(e.target.value)}
                      rows="6"
                    ></textarea>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="book-b1-section">
              <h3 className="book-b1-h3">Review & confirm:</h3>

              <div className="book-b1-note">
                <div style={{ marginBottom: 10 }}>
                  <b>Date:</b> {date ? moment(date).format("DD-MM-YYYY") : "-"}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <b>Time:</b> {selectedSlotLabel || "-"}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <b>Service:</b> {service || "-"}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <b>Phone:</b> {phoneNumber || "-"}
                </div>
                <div>
                  <b>Message:</b> {description || "-"}
                </div>
              </div>
            </div>
          )}

          {/* Navigacija: na Review pokaži Back + Book Appointment (brez Next) */}
          {step !== 3 ? (
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button
                type="button"
                className="contained-btn my-2"
                onClick={back}
                disabled={step === 0}
                style={{ opacity: step === 0 ? 0.6 : 1 }}
              >
                Back
              </button>

              <button
                type="button"
                className="contained-btn my-2"
                onClick={next}
                disabled={!canGoNext()}
                style={{ opacity: !canGoNext() ? 0.6 : 1 }}
              >
                Next
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 14,
                alignItems: "center",
              }}
            >
              <button
                type="button"
                className="contained-btn my-2"
                onClick={back}
              >
                Back
              </button>

              <button
                type="button"
                className="contained-btn my-2"
                onClick={onBookAppointment}
                style={{ marginLeft: "auto" }} // desno
              >
                Book Appointment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookAppointmentB2;
