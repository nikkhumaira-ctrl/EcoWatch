import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#4CAF50", "#2196F3", "#FFC107", "#FF5722", "#9C27B0"];

export default function Analytics() {

  const [totalObs, setTotalObs] = useState(0);
  const [speciesData, setSpeciesData] = useState([]);
  const [locationData, setLocationData] = useState([]);

  useEffect(() => {

    const fetchData = async () => {

      const snapshot = await getDocs(collection(db, "observations"));

      const speciesCount = {};
      const locationCount = {};

      snapshot.forEach((doc) => {

        const data = doc.data();
        const species = data.species;
        const location = data.location;

        // count species
        speciesCount[species] = (speciesCount[species] || 0) + 1;

        // count locations
        locationCount[location] = (locationCount[location] || 0) + 1;

      });

      // total observations
      setTotalObs(snapshot.size);

      // convert to chart format
      const speciesChart = Object.keys(speciesCount).map((key) => ({
        name: key,
        value: speciesCount[key]
      }));

      const locationChart = Object.keys(locationCount).map((key) => ({
        name: key,
        value: locationCount[key]
      }));

      setSpeciesData(speciesChart);
      setLocationData(locationChart);
    };

    fetchData();

  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>

      <h1>EcoWatch Analytics</h1>

      {/* TOTAL OBSERVATIONS */}
      <h2>Total Observations</h2>
      <h1>{totalObs}</h1>

      {/* SPECIES PIE CHART */}
      <h2>Observations by Species</h2>

      <PieChart width={400} height={300}>
        <Pie
          data={speciesData}
          dataKey="value"
          nameKey="name"
          outerRadius={100}
          label
        >
          {speciesData.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip />
        <Legend />

      </PieChart>


      {/* LOCATION PIE CHART */}
      <h2>Observations by Location</h2>

      <PieChart width={400} height={300}>
        <Pie
          data={locationData}
          dataKey="value"
          nameKey="name"
          outerRadius={100}
          label
        >
          {locationData.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip />
        <Legend />

      </PieChart>

    </div>
  );
}