import { Routes, Route } from 'react-router-dom';
import Billing from '../pages/Billing';
import CreateBill from '../pages/CreateBill';
import BillBook from '../pages/BillBook';

export default function BillingRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Billing />} />
      <Route path="/create/:clientId" element={<CreateBill />} />
      <Route path="/bill-book" element={<BillBook />} />
    </Routes>
  );
}