import axios from "axios";
import React, { useState } from "react";

function App() {
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [password] = useState("vanhuY90$");
  const [newPhoneNumbers, setNewPhoneNumbers] = useState(""); 
  const [AllAmount, setAllAmount] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0); 
  const today = new Date(); 
  const [day, setday] = useState(String(today.getDate()).padStart(2, "0"))
  const [month, setmonth] = useState(String(today.getMonth() + 1).padStart(2, "0"))
  const [year, setyear] = useState( today.getFullYear())

  const formattedDate = `${year}-${month}-${day}`; // Định dạng thành DD/MM/YYYY
  console.log("Today:", formattedDate);

  const loginAndGetAmount = async (username) => {
    const getmerchant =
      "/api/profile/v2/merchants?requestType=LOGIN_MERCHANTS&language=vi";
    const headers = {
      // Các header cần thiết nếu có
    };

    const data = {
      username: username,
      password: password,
    };

    try {
      const response = await axios.post(
        "/api/authentication/login?language=vi",
        data,
        {
          headers: headers,
        }
      );

      const token = response.data.data.token;

      const merchantResponse = await axios.get(getmerchant, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const merchantId = merchantResponse.data.data.merchantResponseList[0].id;

      const transactionData = await axios.get(
        `api/transaction/v2/transactions/statistics?pageSize=10&pageNumber=0&fromDate=${formattedDate}T00%3A00%3A00.00&toDate=${formattedDate}T23%3A59%3A59.00&status=ALL&merchantId=${merchantId}&language=vi`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      console.log("nghi",transactionData?.data?.data);
      return transactionData?.data?.data?.totalSuccessAmount || 0;
    
    } catch (error) {
      console.error("Error during login or data fetching:", error);
      return 0;
    }
  };

  const loginAllPhones = () => {
   
    setAllAmount([]);
    setTotalAmount(0);
    phoneNumbers.forEach(async (phone) => {
      const amount = await loginAndGetAmount(phone);

      // Cập nhật từng kết quả vào state và tính tổng tiền
      setAllAmount((prevAmounts) => [...prevAmounts, { phone, amount }]);
      setTotalAmount((prevTotal) => prevTotal + amount); // Cộng thêm vào tổng tiền
    });
  };

  const handleAddPhoneNumbers = () => {
    // Tách chuỗi số điện thoại thành mảng bằng dấu cách hoặc dấu phẩy
    const phonesArray = newPhoneNumbers
      .split(/[,\s]+/) // Tách bằng dấu phẩy hoặc khoảng trắng
      .filter((phone) => phone.trim() !== ""); // Lọc các chuỗi rỗng

    // Thêm vào danh sách số điện thoại hiện tại
    setPhoneNumbers([...phoneNumbers, ...phonesArray]);
    setNewPhoneNumbers(""); // Reset input sau khi thêm
  };
  const HandleTotalYesterday=()=>{
   
    setday(String(today.getDate()).padStart(2, "0")-1);
  }
  const HandleTotalNow =()=>{
   
    setday(String(today.getDate()).padStart(2, "0"))
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Tổng Tiền Ngày: {formattedDate}
      </h1>
      <button onClick={HandleTotalYesterday}>Tổng Hôm Qua</button>
      <button onClick={HandleTotalNow}>Tổng Hôm Nay</button>

      {/* Form nhập chuỗi số điện thoại */}
      <div className="flex items-center justify-center mb-4">
        <textarea
          value={newPhoneNumbers}
          onChange={(e) => setNewPhoneNumbers(e.target.value)}
          placeholder="Nhập dãy số điện thoại, ngăn cách bằng dấu cách hoặc dấu phẩy"
          className="border border-gray-300 rounded p-2 mr-2 w-32"
          rows="10"
        />
        <button
          onClick={handleAddPhoneNumbers}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Thêm số điện thoại
        </button>
      </div>

      <div className="flex items-center justify-center mb-6">
        <button
          onClick={loginAllPhones}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        >
          Đăng nhập và lấy số dư
        </button>
      </div>

      <div className="text-center">
        {AllAmount.map((item, index) => (
          <p key={index} className="text-lg">
            Số điện thoại <span className="font-bold">{item.phone}</span>:{" "}
            {item.amount.toLocaleString()} VND
          </p>
        ))}
      </div>

      <h2 className="text-xl font-bold text-center mt-6">
        Tổng số tiền tất cả: {totalAmount.toLocaleString()} VND
      </h2>
    </div>
  );
}

export default App;
