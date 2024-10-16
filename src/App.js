import axios from "axios";
import React, { useState } from "react";

function App() {
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [password] = useState("vanhuY90$");
  const [newPhoneNumbers, setNewPhoneNumbers] = useState("");
  const [AllAmount, setAllAmount] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const today = new Date();
  const [day, setDay] = useState(String(today.getDate()).padStart(2, "0"));
  const [month, setMonth] = useState(String(today.getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(today.getFullYear());

  const formattedDate = `${year}-${month}-${day}`;
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
      const brandName = merchantResponse.data.data.merchantResponseList[0].brandName;

      const transactionData = await axios.get(
        `api/transaction/v2/transactions/statistics?pageSize=10&pageNumber=0&fromDate=${formattedDate}T00%3A00%3A00.00&toDate=${formattedDate}T23%3A59%3A59.00&status=ALL&merchantId=${merchantId}&language=vi`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const totalSuccessAmount = transactionData?.data?.data?.totalSuccessAmount || 0;

      // Trả về cả amount và brandName
      return { amount: totalSuccessAmount, brandName };
    } catch (error) {
      console.error("Error during login or data fetching:", error);
      return { amount: 0, brandName: "" };
    }
  };

  const loginAllPhones = () => {
    setAllAmount([]);
    setTotalAmount(0);
    phoneNumbers.forEach(async (phone) => {
      const { amount, brandName } = await loginAndGetAmount(phone);

      // Cập nhật từng kết quả vào state và tính tổng tiền
      setAllAmount((prevAmounts) => [
        ...prevAmounts,
        { phone, amount, brandName },
      ]);
      setTotalAmount((prevTotal) => prevTotal + amount);
    });
  };

  const handleAddPhoneNumbers = () => {
    const phonesArray = newPhoneNumbers
      .split(/[,\s]+/)
      .filter((phone) => phone.trim() !== "");

    setPhoneNumbers([...phoneNumbers, ...phonesArray]);
    setNewPhoneNumbers("");
  };

  const HandleTotalYesterday = () => {
    setDay(String(today.getDate() - 1).padStart(2, "0"));
  };

  const HandleTotalNow = () => {
    setDay(String(today.getDate()).padStart(2, "0"));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Tổng Tiền Ngày: {formattedDate}
      </h1>
      <button className="block hover:bg-slate-400 mb-5 px-2 py-1 rounded-lg" onClick={HandleTotalNow}>Tổng Hôm Nay</button>
      <button className="block hover:bg-slate-400 mb-5 px-2 py-1 rounded-lg" onClick={HandleTotalYesterday}>Tổng Hôm Qua</button> 

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
  <table className="table-auto w-full border-collapse border border-gray-400">
    <thead>
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
          <td className="border border-gray-300 px-4 py-2">{item.brandName|| "NULL"}</td>
          <td className="border border-gray-300 px-4 py-2">
           {item.amount.toLocaleString()} VND
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


      <h2 className="text-xl font-bold text-center mt-6">
    Total {formattedDate}:  <span className="text-red-500"> {totalAmount.toLocaleString()} </span> VND
      </h2>
    </div>
  );
}

export default App;
