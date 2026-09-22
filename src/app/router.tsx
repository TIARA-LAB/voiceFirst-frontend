import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { PublicOnly, RequireAuth } from '@/app/guards'

const WelcomePage = lazy(() => import('@/pages/WelcomePage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const VerificationPage = lazy(() => import('@/pages/VerificationPage'))
const BusinessSetupPage = lazy(() => import('@/pages/BusinessSetupPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const RecordTransactionPage = lazy(() => import('@/pages/RecordTransactionPage'))
const ProcessingStatusPage = lazy(() => import('@/pages/ProcessingStatusPage'))
const ConfirmationPage = lazy(() => import('@/pages/ConfirmationPage'))
const EditTransactionPage = lazy(() => import('@/pages/EditTransactionPage'))
const LedgerPage = lazy(() => import('@/pages/LedgerPage'))
const TransactionDetailsPage = lazy(() => import('@/pages/TransactionDetailsPage'))
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
const ProductCreatePage = lazy(() => import('@/pages/ProductCreatePage'))
const StockPage = lazy(() => import('@/pages/StockPage'))
const DebtorsPage = lazy(() => import('@/pages/DebtorsPage'))
const ReportsPage = lazy(() => import('@/pages/ReportsPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const SyncCenterPage = lazy(() => import('@/pages/SyncCenterPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

export const router = createBrowserRouter([
  {
    element: <PublicOnly />,
    children: [
      { path: '/welcome', Component: WelcomePage },
      { path: '/login', Component: LoginPage },
      { path: '/register', Component: RegisterPage },
      { path: '/verify', Component: VerificationPage },
      { path: '/business-setup', Component: BusinessSetupPage },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      { path: '/', element: <Navigate to="/app/dashboard" replace /> },
      {
        path: '/app',
        Component: AppShell,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', Component: DashboardPage },
          { path: 'record', Component: RecordTransactionPage },
          { path: 'process', Component: ProcessingStatusPage },
          { path: 'confirmations/:id', Component: ConfirmationPage },
          { path: 'edit/:id', Component: EditTransactionPage },
          { path: 'ledger', Component: LedgerPage },
          { path: 'transactions/:id', Component: TransactionDetailsPage },
          { path: 'products', Component: ProductsPage },
          { path: 'products/new', Component: ProductCreatePage },
          { path: 'stock', Component: StockPage },
          { path: 'debtors', Component: DebtorsPage },
          { path: 'reports', Component: ReportsPage },
          { path: 'settings', Component: SettingsPage },
          { path: 'sync', Component: SyncCenterPage },
        ],
      },
    ],
  },
  { path: '*', Component: NotFoundPage },
])