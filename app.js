// Khai báo các biến DOM elements
var newMemberAddBtn = document.querySelector('.addMemberBtn'),
darkBg = document.querySelector('.dark_bg'),
popupForm = document.querySelector('.popup'),
crossBtn = document.querySelector('.closeBtn'),
submitBtn = document.querySelector('.submitBtn'),
modalTitle = document.querySelector('.modalTitle'),
popupFooter = document.querySelector('.popupFooter'),
imgInput = document.querySelector('.img'),
imgHolder = document.querySelector('.imgholder'),
form = document.querySelector('form'),
formInputFields = document.querySelectorAll('form input'),
uploadimg = document.querySelector("#uploadimg"),
fName = document.getElementById("fName"),
lName = document.getElementById("lName"),
age = document.getElementById("age"),
city = document.getElementById("city"),
position = document.getElementById("position"),
salary = document.getElementById("salary"),
sDate = document.getElementById("sDate"),
email = document.getElementById("email"),
phone = document.getElementById("phone"),
entries = document.querySelector(".showEntries"),
tabSize = document.getElementById("table_size"),
userInfo = document.querySelector(".userInfo"),
table = document.querySelector("table"),
filterData = document.getElementById("search");

// Khởi tạo các biến trạng thái
let originalData = [];
let getData = [];
let isEdit = false, editId;
var arrayLength = 0;
var tableSize = 10;
var startIndex = 1;
var endIndex = 0;
var currentIndex = 1;
var maxIndex = 0;

// Biến theo dõi chiều sắp xếp cho các trường
let sortDirection = {
    name: true,
    age: true,
    salary: true
};

// Hàm kiểm tra và cập nhật ảnh mặc định
function checkAndUpdateDefaultImage(imageUrl) {
    return (!imageUrl || imageUrl === "" || imageUrl === "undefined") ? "./img/pic1.png" : imageUrl;
}

// Hàm fetch data từ API
async function fetchDataFromAPI() {
    try {
        const response = await fetch('https://67176e93b910c6a6e0282004.mockapi.io/api/project1/User');
        const data = await response.json();
        originalData = data;
        getData = [...originalData];
        localStorage.setItem('userProfile', JSON.stringify(originalData));
        preLoadCalculations();
        displayIndexBtn();
        showInfo();
    } catch (error) {
        console.error('Error fetching data:', error);
        originalData = localStorage.getItem('userProfile') ? JSON.parse(localStorage.getItem('userProfile')) : [];
        getData = [...originalData];
        preLoadCalculations();
        displayIndexBtn();
        showInfo();
    }
}

// Event Listeners
newMemberAddBtn.addEventListener('click', ()=> {
    isEdit = false;
    submitBtn.innerHTML = "Submit";
    modalTitle.innerHTML = "Fill the Form";
    popupFooter.style.display = "block";
    imgInput.src = "./img/pic1.png";
    darkBg.classList.add('active');
    popupForm.classList.add('active');
});

crossBtn.addEventListener('click', ()=>{
    darkBg.classList.remove('active');
    popupForm.classList.remove('active');
    form.reset();
});

uploadimg.onchange = function(){
    if(uploadimg.files[0].size < 1000000){   // 1MB = 1000000
        var fileReader = new FileReader();
        fileReader.onload = function(e){
            var imgUrl = e.target.result;
            imgInput.src = imgUrl;
        }
        fileReader.readAsDataURL(uploadimg.files[0]);
    }
    else{
        alert("This file is too large!");
    }
}

// Pagination functions
function preLoadCalculations(){
    array = getData;
    arrayLength = array.length;
    maxIndex = arrayLength / tableSize;
    if((arrayLength % tableSize) > 0){
        maxIndex++;
    }
}

function displayIndexBtn(){
    preLoadCalculations();
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = "";
    pagination.innerHTML = '<button onclick="prev()" class="prev">Previous</button>';
    for(let i=1; i<=maxIndex; i++){
        pagination.innerHTML += '<button onclick="paginationBtn('+i+')" index="'+i+'">'+i+'</button>';
    }
    pagination.innerHTML += '<button onclick="next()" class="next">Next</button>';
    highlightIndexBtn();
}

function highlightIndexBtn(){
    startIndex = ((currentIndex - 1) * tableSize) + 1;
    endIndex = (startIndex + tableSize) - 1;
    if(endIndex > arrayLength){
        endIndex = arrayLength;
    }
    if(maxIndex >= 2){
        var nextBtn = document.querySelector(".next");
        nextBtn.classList.add("act");
    }
    entries.textContent = `Showing ${startIndex} to ${endIndex} of ${arrayLength} entries`;
    var paginationBtns = document.querySelectorAll('.pagination button');
    paginationBtns.forEach(btn => {
        btn.classList.remove('active');
        if(btn.getAttribute('index') === currentIndex.toString()){
            btn.classList.add('active');
        }
    });
    showInfo();
}

// Display data in table
function showInfo(){
    document.querySelectorAll(".employeeDetails").forEach(info => info.remove());
    var tab_start = startIndex - 1;
    var tab_end = endIndex;
    if(getData.length > 0){
        for(var i=tab_start; i<tab_end; i++){
            var staff = getData[i];
            if(staff){
                let createElement = `<tr class="employeeDetails">
                    <td>${i+1}</td>
                    <td><img src="${checkAndUpdateDefaultImage(staff.picture)}" alt="" width="40" height="40"></td>
                    <td>${staff.fName + " " + staff.lName}</td>
                    <td>${staff.ageVal}</td>
                    <td>${staff.cityVal}</td>
                    <td>${staff.positionVal}</td>
                    <td>${staff.salaryVal}</td>
                    <td>${staff.sDateVal}</td>
                    <td>${staff.emailVal}</td>
                    <td>${staff.phoneVal}</td>
                    <td>
                        <button onclick="readInfo('${checkAndUpdateDefaultImage(staff.picture)}', '${staff.fName}', '${staff.lName}', '${staff.ageVal}', '${staff.cityVal}', '${staff.positionVal}', '${staff.salaryVal}', '${staff.sDateVal}', '${staff.emailVal}', '${staff.phoneVal}')"><i class="fa-regular fa-eye"></i></button>
                        <button onclick="editInfo('${i}', '${checkAndUpdateDefaultImage(staff.picture)}', '${staff.fName}', '${staff.lName}', '${staff.ageVal}', '${staff.cityVal}', '${staff.positionVal}', '${staff.salaryVal}', '${staff.sDateVal}', '${staff.emailVal}', '${staff.phoneVal}')"><i class="fa-regular fa-pen-to-square"></i></button>
                        <button onclick="deleteInfo(${i})"><i class="fa-regular fa-trash-can"></i></button>
                    </td>
                </tr>`;
                userInfo.innerHTML += createElement;
                table.style.minWidth = "1400px";
            }
        }
    }
    else{
        userInfo.innerHTML = '<tr class="employeeDetails"><td class="empty" colspan="11" align="center">No data available in table</td></tr>';
        table.style.minWidth = "1400px";
    }
}

// CRUD Operations
function readInfo(pic, fname, lname, Age, City, Position, Salary, SDate, Email, Phone){
    imgInput.src = checkAndUpdateDefaultImage(pic);
    fName.value = fname;
    lName.value = lname;
    age.value = Age;
    city.value = City;
    position.value = Position;
    salary.value = Salary;
    sDate.value = SDate;
    email.value = Email;
    phone.value = Phone;
    darkBg.classList.add('active');
    popupForm.classList.add('active');
    popupFooter.style.display = "none";
    modalTitle.innerHTML = "Profile";
    formInputFields.forEach(input => {
        input.disabled = true;
    });
    imgHolder.style.pointerEvents = "none";
}

function editInfo(id, pic, fname, lname, Age, City, Position, Salary, SDate, Email, Phone){
    isEdit = true;
    editId = id;
    imgInput.src = checkAndUpdateDefaultImage(pic);
    fName.value = fname;
    lName.value = lname;
    age.value = Age;
    city.value = City;
    position.value = Position;
    salary.value = Salary;
    sDate.value = SDate;
    email.value = Email;
    phone.value = Phone;
    darkBg.classList.add('active');
    popupForm.classList.add('active');
    popupFooter.style.display = "block";
    modalTitle.innerHTML = "Update the Form";
    submitBtn.innerHTML = "Update";
    formInputFields.forEach(input => {
        input.disabled = false;
    });
    imgHolder.style.pointerEvents = "auto";
}

async function deleteInfo(index) {
    if(confirm("Are you sure want to delete?")) {
        try {
            const userToDelete = originalData[index];
            await fetch(`https://67176e93b910c6a6e0282004.mockapi.io/api/project1/User/${userToDelete.id}`, {
                method: 'DELETE'
            });

            originalData.splice(index, 1);
            localStorage.setItem("userProfile", JSON.stringify(originalData));
            getData = [...originalData];
            preLoadCalculations();
            
            if(getData.length === 0){
                currentIndex = 1;
                startIndex = 1;
                endIndex = 0;
            }
            else if(currentIndex > maxIndex){
                currentIndex = maxIndex;
            }
            
            showInfo();
            highlightIndexBtn();
            displayIndexBtn();
            
            var nextBtn = document.querySelector('.next');
            var prevBtn = document.querySelector('.prev');
            if(Math.floor(maxIndex) > currentIndex){
                nextBtn.classList.add("act");
            } else {
                nextBtn.classList.remove("act");
            }
            if(currentIndex > 1){
                prevBtn.classList.add('act');
            }
        } catch (error) {
            console.error('Error deleting data:', error);
            alert('Error deleting data. Please try again.');
        }
    }
}

// Form Submit Handler
form.addEventListener('submit', async (e)=> {
    e.preventDefault();
    const information = {
        picture: imgInput.src === "" ? "./img/pic1.png" : imgInput.src,
        fName: fName.value,
        lName: lName.value,
        ageVal: age.value,
        cityVal: city.value,
        positionVal: position.value,
        salaryVal: salary.value,
        sDateVal: sDate.value,
        emailVal: email.value,
        phoneVal: phone.value
    };

    try {
        if(!isEdit){
            // Create new user
            const response = await fetch('https://67176e93b910c6a6e0282004.mockapi.io/api/project1/User', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(information)
            });
            const newUser = await response.json();
            originalData.unshift(newUser);
        } else {
            // Update existing user
            const response = await fetch(`https://67176e93b910c6a6e0282004.mockapi.io/api/project1/User/${originalData[editId].id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(information)
            });
            const updatedUser = await response.json();
            originalData[editId] = updatedUser;
        }

        getData = [...originalData];
        localStorage.setItem('userProfile', JSON.stringify(originalData));
        submitBtn.innerHTML = "Submit";
        modalTitle.innerHTML = "Fill the Form";
        darkBg.classList.remove('active');
        popupForm.classList.remove('active');
        form.reset();
        highlightIndexBtn();
        displayIndexBtn();
        showInfo();

        var nextBtn = document.querySelector(".next");
        var prevBtn = document.querySelector(".prev");
        if(Math.floor(maxIndex) > currentIndex){
            nextBtn.classList.add("act");
        } else {
            nextBtn.classList.remove("act");
        }
        if(currentIndex > 1){
            prevBtn.classList.add("act");
        }
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error saving data. Please try again.');
    }
});

// Sorting functions
function sortData(field, direction, isString = false) {
    const sortedData = [...getData];
    sortedData.sort((a, b) => {
        let valueA = isString ? a[field].toLowerCase() : parseFloat(a[field]);
        let valueB = isString ? b[field].toLowerCase() : parseFloat(b[field]);

        return direction ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });
    getData = sortedData;
    showInfo();
}

// Event Listeners cho các nút sắp xếp
document.getElementById('sortName').addEventListener('click', () => {
    sortDirection.name = !sortDirection.name;
    sortData('fName', sortDirection.name, true);
    currentIndex = 1;
    displayIndexBtn();
});

document.getElementById('sortAge').addEventListener('click', () => {
    sortDirection.age = !sortDirection.age;
    sortData('ageVal', sortDirection.age, false); // Gọi hàm sortData với isString = false cho tuổi
    currentIndex = 1;
    displayIndexBtn();
});

document.getElementById('sortSalary').addEventListener('click', () => {
    sortDirection.salary = !sortDirection.salary;
    sortData('salaryVal', sortDirection.salary, false);
    currentIndex = 1;
    displayIndexBtn();
});

// Pagination Navigation
function next(){
    var prevBtn = document.querySelector('.prev');
    var nextBtn = document.querySelector('.next');
    if(currentIndex <= maxIndex - 1){
        currentIndex++;
        prevBtn.classList.add("act");
        highlightIndexBtn();
    }
    if(currentIndex > maxIndex - 1){
        nextBtn.classList.remove("act");
    }
}

function prev(){
    var prevBtn = document.querySelector('.prev');
    if(currentIndex > 1){
        currentIndex--;
        prevBtn.classList.add("act");
        highlightIndexBtn();
    }
    if(currentIndex < 2){
        prevBtn.classList.remove("act");
    }
}

function paginationBtn(i){
    currentIndex = i;
    var prevBtn = document.querySelector('.prev');
    var nextBtn = document.querySelector('.next');
    highlightIndexBtn();
    if(currentIndex > maxIndex - 1){
        nextBtn.classList.remove('act');
    } else {
        nextBtn.classList.add("act");
    }
    if(currentIndex > 1){
        prevBtn.classList.add("act");
    }
    if(currentIndex < 2){
        prevBtn.classList.remove("act");
    }
}

// Table size change handler
tabSize.addEventListener('change', ()=>{
    var selectedValue = parseInt(tabSize.value);
    tableSize = selectedValue;
    currentIndex = 1;
    startIndex = 1;
    displayIndexBtn();
});

// Search/Filter handler
filterData.addEventListener("input", ()=> {
    const searchTerm = filterData.value.toLowerCase().trim();
    if(searchTerm !== ""){
        const filteredData = originalData.filter((item) => {
            const fullName = (item.fName + " " + item.lName).toLowerCase();
            const city = item.cityVal.toLowerCase();
            const position = item.positionVal.toLowerCase();
            return(
                fullName.includes(searchTerm) ||
                city.includes(searchTerm) ||
                position.includes(searchTerm)
            );
        });
        getData = filteredData;
    } else {
        getData = [...originalData];
    }
    currentIndex = 1;
    startIndex = 1;
    displayIndexBtn();
});

// Initialize the application
document.addEventListener('DOMContentLoaded', fetchDataFromAPI);
displayIndexBtn();