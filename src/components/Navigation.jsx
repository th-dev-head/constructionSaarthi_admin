import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./page/auth/Login";
import ForgotPassword from "./page/auth/ForgotPassword";
import ResetPassword from "./page/auth/ResetPassword";
import Dashboard from "./page/dashboard/Dashboard";
import Users from "./page/userManagement/user";
import { DashBoardLayout } from "./DashBoardLayout";
import Subscriptions from "./page/Subscriptions/Subscriptions";
import ManagePlan from "./page/Subscriptions/ManagePlan";
import SubscriptionDescription from "./page/Subscriptions/SubscriptionDescription";
import Permissions from "./page/Roles/Permissions";
import Roles from "./page/Roles/Roles";
import Feature from "./page/Roles/Feature";
import Gavge from "./page/types/GavgeType";
import Media from "./page/types/MediaType";
import Shift from "./page/types/ShiftType";
import Inventory from "./page/types/InventoryType";
import Coupon from "./page/types/CouponType";
import BankType from "./page/types/BankType";
import OTPSend from "./page/auth/OTP";
import CouponManagement from "./page/couponmanagement/Coupon Management";
import CreatePrompt from "./page/prompts/CreatePrompt";
import PromptsList from "./page/prompts/PromptsList";
import PMFeatureManagement from "./page/prompts/PMFeatureManagement";
import PromptReferenceManagement from "./page/prompts/PromptReferenceManagement";
import Support from "./page/help/Support";
import BannerManagement from "./page/banner/BannerManagement";
import CategoryManagement from "./page/category/CategoryManagement";
import ConstructionType from "./page/types/ConstructionType";
import ContractType from "./page/types/ContractType";
import Leads from "./page/leads/Leads";

const Navigation = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/otp-send" element={<OTPSend />} />
      <Route path="/forgot-pass" element={<ForgotPassword />} />
      <Route path="/reset-pass" element={<ResetPassword />} />

      <Route element={<DashBoardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/manage-plans" element={<ManagePlan />} />
        <Route path="/subscription-description" element={<SubscriptionDescription />} />
        <Route path="/roles/role-management" element={<Roles />} />
        <Route path="/roles/feature-management" element={<Feature />} />
        <Route path="/roles/permission-management" element={<Permissions />} />
        <Route path="/gavge" element={<Gavge />} />
        <Route path="/media" element={<Media />} />
        <Route path="/shift" element={<Shift />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/coupon" element={<Coupon />} />
        <Route path="/bank" element={<BankType />} />
        <Route path="/construction" element={<ConstructionType />} />
        <Route path="/contract-type" element={<ContractType />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/coupon-management" element={<CouponManagement />} />
        <Route path="/prompts" element={<PromptsList />} />
        <Route path="/prompts/create" element={<CreatePrompt />} />
        <Route path="/prompts/edit/:id" element={<CreatePrompt />} />
        <Route path="/prompts/view/:id" element={<CreatePrompt />} />
        <Route path="/prompts/features" element={<PMFeatureManagement />} />
        <Route path="/prompts/references" element={<PromptReferenceManagement />} />
        <Route path="/help" element={<Support />} />
        <Route path="/banner-management" element={<BannerManagement />} />
        <Route path="/category-management" element={<CategoryManagement />} />
        <Route path="/help/faqs" element={<Support />} />
        <Route path="/help/tickets" element={<Support />} />
        <Route path="/help/feedbacks" element={<Support />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default Navigation;
