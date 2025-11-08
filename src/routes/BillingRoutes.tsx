import { Routes, Route } from 'react-router-dom';
import Billing from '../pages/Billing';
import CreateBill from '../pages/CreateBill';

export default function BillingRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Billing />} />
      <Route path="/create/:clientId" element={<CreateBill />} />
    </Routes>
  );
}