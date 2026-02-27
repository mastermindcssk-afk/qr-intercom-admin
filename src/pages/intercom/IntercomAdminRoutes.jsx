import React from 'react';
import { Route } from 'react-router-dom';
import IntercomLayout    from '../../components/layout/IntercomLayout';
import IntercomDashboard from './IntercomDashboard';
import LiveActivityPage  from './LiveActivityPage';
import QRCodesPage       from './QRCodesPage';
import EntryPointsPage   from './EntryPointsPage';
import VisitReasonsPage  from './VisitReasonsPage';
import RoutingRulesPage  from './RoutingRulesPage';
import SchedulesPage     from './SchedulesPage';
import AccessLogsPage    from './AccessLogsPage';
import AnalyticsPage     from './AnalyticsPage';
import StaffPage         from './StaffPage';
import LocationsPage     from './LocationsPage';
import BrandingPage      from './BrandingPage';
import SettingsPage      from './SettingsPage';

const IntercomAdminRoutes = (
  <Route path="/intercom" element={<IntercomLayout />}>
    <Route index             element={<IntercomDashboard />} />
    <Route path="live"       element={<LiveActivityPage />}  />
    <Route path="qr"         element={<QRCodesPage />}       />
    <Route path="entries"    element={<EntryPointsPage />}   />
    <Route path="reasons"    element={<VisitReasonsPage />}  />
    <Route path="routing"    element={<RoutingRulesPage />}  />
    <Route path="schedules"  element={<SchedulesPage />}     />
    <Route path="logs"       element={<AccessLogsPage />}    />
    <Route path="analytics"  element={<AnalyticsPage />}     />
    <Route path="staff"      element={<StaffPage />}         />
    <Route path="locations"  element={<LocationsPage />}     />
    <Route path="branding"   element={<BrandingPage />}      />
    <Route path="settings"   element={<SettingsPage />}      />
  </Route>
);

export default IntercomAdminRoutes;
