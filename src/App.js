import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";

function App() {
  const [people, setPeople] = useState({
    firstName: "",
    secondName: "",
  });

  const [pageNum, setPageNum] = useState(0);
  const [moreSearch, setMoreSearch] = useState(true);
  const [firstFollowers, setFirstFollowers] = useState([]);
  const [secondFollowers, setSecondFollowers] = useState([]);
  const [resultList, setResultList] = useState([]);

  useEffect(() => {
    if(people.firstName !== "" && people.secondName !== "" && pageNum!== 0 ){
      setResultList([]);
      Promise.all([
        fetch("https://api.github.com/users/"+people.firstName+ "/followers?per_page=100&page="+pageNum),
        fetch("https://api.github.com/users/"+people.secondName+ "/followers?per_page=100&page="+pageNum),
      ])
        .then(([resFirstFollowers, resSecondFollowers]) => 
          Promise.all([resFirstFollowers.json(), resSecondFollowers.json()])
        )
        .then(([dataFirstFollowers, dataSecondFollowers]) => {
          //compare two array of followers with state update
          let arrFirstFollowers = firstFollowers.length > 0? dataFirstFollowers.concat(firstFollowers): dataFirstFollowers;
          let arrSecondFollowers = secondFollowers.length > 0? dataSecondFollowers.concat(secondFollowers): dataSecondFollowers;
          
          let arr=arrFirstFollowers.filter(item => arrSecondFollowers.some(({id}) => item.id === id));
          
          arr=arr.filter(item => arr.some((id)=>item.id !== id));
          arr.map((item) => setResultList(current => [...current, item]));
          
          dataFirstFollowers.map((item)=>setFirstFollowers(current => [...current, item]));
          dataSecondFollowers.map((item)=>setSecondFollowers(current => [...current, item]));
          
          //stop search if no data can be found
          if(dataFirstFollowers.length === 0 && dataSecondFollowers.length === 0){
            setMoreSearch(false);
          } 
        });
        
    }
   
  },[pageNum, people]);

  const handleChange = (event) => {
    setPeople({ ...people, [event.target.id]: event.target.value });
    //clear the state when name changed
    setResultList([]);
    setMoreSearch(true);
    setPageNum(0);
    setFirstFollowers([]);
    setSecondFollowers([]);
  };

  const handleDisplay = (event) => {
      
      if(people.firstName !== "" && people.secondName !== "" && pageNum === 0 ){
        setPageNum(1);
      }
      
      if(people.firstName === "" || people.secondName === "" ){
        alert("Person name(s) need to be filled!")
      }
  };

  const moreDisplay = (event) => {
    setPageNum(pageNum + 1);
  };



  return (
    <>
      <Container maxWidth="md">
      <h1>Display Common followers</h1>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField
              id="firstName"
              label="Person 1"
              defaultValue={people.firstName}
              onChange={handleChange}
              sx={{ height: 40 }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id="secondName"
              label="Person 2"
              defaultValue={people.secondName}
              onChange={handleChange}
              sx={{ height: 40 }}
            />
          </Grid>

          <Grid item xs={4}>
            <Button
              onClick={handleDisplay}
              variant="outlined"
              href="#outlined-buttons"
              sx={{ height: 55 }}
            >
              Display common followers
            </Button>
          </Grid>
          <Grid item xs={12}>
            <ol>
            {resultList.length>0? resultList.map((artist, index) => (
          <li key={index}>{artist.login}</li>
        )): ""}
          </ol>
          
          </Grid>
          <Grid item xs={12}>         
          {resultList.length>0 && moreSearch===true? <Button
              onClick={moreDisplay}
              variant="outlined"
              href="#outlined-buttons"
              sx={{ height: 55 }}
            >
              More Result
            </Button> : ""}
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default App;
