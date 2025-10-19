import Layout from "@/components/app/layout";
import NavTabs from "@/components/NavTabs";
import React from "react";

function Profile() {
  const tabs = [
    { name: "Overview", href: "/clubs" },
    { name: "Pending", href: "/pending-clubs" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <Layout>
      <NavTabs tabs={tabs}/>
      <div>Profile</div>
    </Layout>
  );
}

export default Profile;
