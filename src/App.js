import axios from "axios";
import React, { useState } from "react";
function App() {
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [password] = useState("vanhuY90$");
  const [newPhoneNumbers, setNewPhoneNumbers] = useState("");
  const [AllAmount, setAllAmount] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [ActiveDay, setActiveDay] = useState("Now");
  const today = new Date();
  const [day, setDay] = useState(String(today.getDate()).padStart(2, "0"));
  const [month] = useState(String(today.getMonth() + 1).padStart(2, "0"));
  const [year] = useState(today.getFullYear());
  const [error, seteError] = useState();
  const formattedDate = `${year}-${month}-${day}`;
  const loginAndGetAmount = async (username) => {
    const getmerchant = "/api/profile/v2/merchants?requestType=LOGIN_MERCHANTS&language=vi";
    const data = {
      username: username,
      password: password,
    };
    try {
      const response = await axios.post(
        "/api/authentication/login?language=vi",
        data,
      );
      const token = response.data.data.token;
      const merchantResponse = await axios.get(getmerchant, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      const merchantId = merchantResponse.data.data.merchantResponseList[0].id;
      const brandName = merchantResponse.data.data.merchantResponseList[0].brandName;
      const transactionData = await axios.get(
        `api/transaction/v2/transactions/statistics?pageSize=10&pageNumber=0&fromDate=${ActiveDay === "AllDay"?firstDay:formattedDate}T00%3A00%3A00.00&toDate=${ActiveDay === "AllDay"?lastDay:formattedDate}T23%3A59%3A59.00&status=ALL&merchantId=${merchantId}&language=vi`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      const totalSuccessAmount = transactionData?.data?.data?.totalSuccessAmount || 0;
      return { amount: totalSuccessAmount, brandName };
    } catch (error) {
      seteError("Đã Có Lỗi, Cần Chạy Lại... Kiểm Tra Các SĐT phải cùng 1 Mật Khẩu Nhé. Thực Hiện Lại Sau 5s");
      console.error("Lỗi Nghi Ơi:", error);
      return { amount: 0, brandName: "" };
     
    }
  };
  const loginAllPhones = async () => {
    setAllAmount([]);
    setTotalAmount(0);
    seteError();
    for (const phone of phoneNumbers) {
      const { amount, brandName } = await loginAndGetAmount(phone);
      setAllAmount((prevAmounts) => [
        ...prevAmounts,
        { phone, amount, brandName },
      ]);
      setTotalAmount((prevTotal) => prevTotal + amount);
    }
  };
  const handleAddPhoneNumbers = () => {
    const phonesArray = newPhoneNumbers.split(/[,\s]+/).filter((phone) => phone.trim() !== "");
    setPhoneNumbers([...phoneNumbers, ...phonesArray]);
    setNewPhoneNumbers("");
  };
  const HandleTotalYesterday = () => {
    setActiveDay("Yesterday");
    setDay(String(today.getDate() - 1).padStart(2, "0"));
  };
  const HandleTotalNow = () => {
    setActiveDay("Now");
    setDay(String(today.getDate()).padStart(2, "0"));
  };
  const HandleTotalAllDayMonth =()=>{
    setActiveDay("AllDay");
  }
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getFirstAndLastDayOfMonth(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { firstDay: formatDate(firstDay), lastDay: formatDate(lastDay) };
}

const { firstDay, lastDay } = getFirstAndLastDayOfMonth(2024, month-1);



  return (
    <div className="container mx-auto p-4 bg-gray-200/50 relative ">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Tổng Tiền Ngày: {ActiveDay === "AllDay" ? `Toàn bộ tháng ${month}`:`${day}-${month}-${year}`}
      </h1>
      <button
        className={`block hover:bg-slate-400 mb-5 px-2 py-1 rounded-lg ${ActiveDay === "Now" ? " bg-green-300" : ""}`}
        onClick={HandleTotalNow}
      >
        Tổng Hôm Nay: <span className="font-bold text-red-500">{String(today.getDate()).padStart(2, "0")}/{String(today.getMonth() + 1).padStart(2, "0")}</span>
      </button>
      <button
        className={`block hover:bg-slate-400 mb-5 px-2 py-1 rounded-lg ${ActiveDay === "Yesterday" ? " bg-green-300" : ""}`}
        onClick={HandleTotalYesterday}
      >
        Tổng Hôm Qua :<span className="font-bold text-red-500">{String(today.getDate() - 1).padStart(2, "0")}/{String(today.getMonth() + 1).padStart(2, "0")}</span>
      </button>
      <button
        className={`block hover:bg-slate-400 mb-5 px-2 py-1 rounded-lg ${ActiveDay === "AllDay" ? " bg-green-300" : ""}`}
        onClick={HandleTotalAllDayMonth}
      >
        Tổng 1 Tháng :<span className="font-bold text-red-500">{`${firstDay}-${lastDay}`}</span>
      </button>
      <div className="flex items-center justify-center mb-4">
        <textarea
          value={newPhoneNumbers}
          onChange={(e) => setNewPhoneNumbers(e.target.value)}
          placeholder="Nhập dãy số điện thoại, ngăn cách bằng dấu cách hoặc dấu phẩy"
          className="border border-gray-300 rounded p-2 mr-2 w-30"
          rows="4"
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
        <table className="table-auto w-full border-collapse border border-gray-400">
          <thead className="sticky top-0 right-0">
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Số điện thoại</th>
              <th className="border border-gray-300 px-4 py-2">Tên Shop</th>
              <th className="border border-gray-300 px-4 py-2">Số tiền</th>
            </tr>
          </thead>
          <tbody>
            {AllAmount.map((item, index) => (
              <tr key={index} className="bg-white border-b">
                <td className="border border-gray-300 px-4 py-2">{item.phone}</td>
                <td className="border border-gray-300 px-4 py-2">{item.brandName || "NULL"}</td>
                <td className="border border-gray-300 px-4 py-2">{item.amount.toLocaleString()} VND</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sticky bottom-0 right-0">
        {error?
        <h2 className="text-xl font-bold text-center mt-6 text-red-600 bg-yellow-400">{error}</h2>:
       <>
        <h2 className="text-xl font-bold text-center mt-6 bg-green-300 ">
        Total {ActiveDay === "AllDay" ? `Toàn bộ tháng ${month}`:`${day}-${month}-${year}`}:{" "}
        <span className="text-red-500"> {totalAmount.toLocaleString()} </span> VND
      </h2>
       <p className=" bg-green-300"> <span className="text-red-600">{`${AllAmount.length} `}</span> QR</p></>
      }
      </div>
    </div>
  );
}

export default App;
