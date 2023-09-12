/*
  Exercise 3
  DOM manipulation with vanilla JS
*/

// Task
// What does DOM stand for?

// Task
// Open the file index.html in AWS Cloud9. Click "Preview" > "Preview File index.html". (Note that you can open it in a new window). What do you see?
// If you are working locally, navigate to the excercise directory and start a python http server `python3 -m http.server 900`, press Control-c to stop the server 

// Task
// Delete the div with the class rectangle from index.html and refresh the preview.

// Task
// What does the following code do?



// Task
// Where can you see the results of the console.log below? How is it different from in previous exercises?

function drawIrisData() {
  window
    .fetch("./iris_json.json")
    .then(data => data.json())
    .then(data => {

      const viz = document.body.querySelector(".viz");
      const button = document.body.querySelector("#button");

      const addChildToViz = () => {
        for (let i =0; i < data.length; i++ ) {
          const newChild = document.createElement("div");
          newChild.className = "rectangle";
          newChild.style.height = data[i].petallength * 10 + 'px';
          viz.appendChild(newChild);
        }
    
      };
      
      button.addEventListener("click", addChildToViz);



         
      console.log(data[0].petallength);
    });

   


}

drawIrisData();
