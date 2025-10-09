import { Col, Row, message } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ShowLoader } from "../../redux/loaderSlice";
import { GetAllApprovedBarbers } from "../../apicalls/barbers";

const Home = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [barbers, setBarbers] = useState([]);
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleChangeFilter = (e) => {
    setFilter(e.target.value);
  };

  const getData = async () => {
    try {
      dispatch(ShowLoader(true));
      const response = await GetAllApprovedBarbers(); // ✅ samo approved barberji
      if (response.success) {
        setBarbers(response.data);
      } else {
        message.error(response.message);
      }
      dispatch(ShowLoader(false));
    } catch (error) {
      message.error(error.message);
      dispatch(ShowLoader(false));
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const barbersFilter = barbers.filter((barber) => {
    const matchesSearch =
      barber.firstName.toLowerCase().includes(search.toLowerCase()) ||
      barber.lastName.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "all" || barber.speciality === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-2">
      <div className="flex justify-between">
        <div className="w-half">
          <input
            placeholder="Search"
            onChange={(e) => setSearch(e.target.value)}
            className="search rounded"
          />
        </div>
        <div className="flex gap-2">
          <p className="text-center">Filter:</p>
          <select
            className="rounded p-1"
            name="services"
            id="services"
            onChange={handleChangeFilter}
          >
            <option value="all">All</option>
            <option value="hair">Hair</option>
            <option value="beard">Beard</option>
            <option value="face">Face</option>
          </select>
        </div>
        {user?.role === "user" && (
          <button
            className="outlined-btn"
            onClick={() => navigate("/apply-barber")}
          >
            Apply As a Barber
          </button>
        )}
      </div>
      <Row className="my-1 grid-container justify-between">
        {barbersFilter.map((barber) => (
          <Col key={barber.id} className="grid-item py-2">
            <div
              className="bg-white p-2 justify-between rounded flex-col gap-1 cursor-pointer"
              onClick={() => navigate(`/book-appointment/${barber.id}`)}
            >
              <div className="flex justify-between">
                <h2 className="uppercase">
                  {barber.firstName} {barber.lastName}
                </h2>
              </div>
              <br />
              <hr />
              <br />
              <div className="flex justify-between w-full">
                <h4>
                  <b>Experience:</b>
                </h4>
                <h4>{barber.experience} Years</h4>
              </div>
              <div className="flex justify-between w-full">
                <h4>
                  <b>Email:</b>
                </h4>
                <h4>{barber.email}</h4>
              </div>
              <div className="flex justify-between w-full">
                <h4>
                  <b>Phone:</b>
                </h4>
                <h4>{barber.phone}</h4>
              </div>
              <div className="flex justify-between w-full">
                <h4>
                  <b>Speciality:</b>
                </h4>
                <h4 className="uppercase">{barber.speciality}</h4>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home;
