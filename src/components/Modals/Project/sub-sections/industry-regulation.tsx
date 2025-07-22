import { useState, useEffect } from "react";
import { BASE_URL } from "@/constant/constant";
import axios from "axios";
import { getSession } from "next-auth/react";
import MinistryDocuments from "./industry-regulation/MinistryDocuments";

// Helper function to capitalize first letter of each word
function capitalizeFirstLetterEachWord(str: string) {
    return str
        .split("_")
        .filter(Boolean)
        .map(
            (word: string) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
}

const TABS = [
    { key: "governments", label: "Government Bodies" },
    { key: "private-bodies", label: "Private Bodies" },
];

const IndustryRegulation = () => {
    const [ministries, setMinistries] = useState<any[]>([]);
    const [ministriesLoading, setMinistriesLoading] = useState(false);
    const [ministriesError, setMinistriesError] = useState<string | null>(null);
    const [selectedMinistry, setSelectedMinistry] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState<string>("governments");

    useEffect(() => {
        const fetchBodies = async () => {
            setMinistriesLoading(true);
            setMinistriesError(null);
            const session = await getSession();
            try {
                const token = session?.accessToken;
                let url = "";
                if (activeTab === "governments") {
                    url = `${BASE_URL}/governments-reports/ministries`;
                } else if (activeTab === "private-bodies") {
                    url = `${BASE_URL}/private-bodies-reports/private-bodies`;
                } else {
                    setMinistries([]);
                    setMinistriesLoading(false);
                    return;
                }
                const res = await axios.get(
                    url,
                    {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                    }
                );
                if (res.status !== 200) throw new Error(`Failed to fetch ${activeTab === "governments" ? "ministries" : "private bodies"}`);
                const data = await res.data;
                setMinistries(Array.isArray(data) ? data : []);
            } catch (err: any) {
                setMinistriesError(err.message || `Error fetching ${activeTab === "governments" ? "ministries" : "private bodies"}`);
            } finally {
                setMinistriesLoading(false);
            }
        };
        fetchBodies();
    }, [activeTab]);

    // If a ministry is selected, show its documents (nested folder structure)
    if (selectedMinistry) {
        return (
            <MinistryDocuments
                ministry={selectedMinistry}
                onBack={() => setSelectedMinistry(null)}
                type={activeTab as "governments" || "private-bodies"}
            />
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex border-b border-[#eaf0fc] mb-2">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`px-4 py-2 text-sm font-medium focus:outline-none ${
                            activeTab === tab.key
                                ? "border-b-2 border-[#3b82f6] text-[#001742] bg-white"
                                : "text-[#4e5971] bg-[#f5f7fa]"
                        }`}
                        style={{
                            borderTopLeftRadius: "6px",
                            borderTopRightRadius: "6px",
                            marginRight: "4px",
                        }}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            {/* Tab Content */}
            <div>
                    <div className="mb-4">
                        <h3 className="text-base font-medium mb-1 text-[#001742]">{activeTab === "governments" ? "Government Bodies" : "Private Bodies"}</h3>
                        <div
                            className="overflow-y-auto"
                            style={{ maxHeight: "480px", minHeight: "60px", height: "40%" }}
                        >
                            {ministriesLoading ? (
                                <div className="p-4 text-sm text-[#4e5971]">Loading {activeTab === "governments" ? "government bodies" : "private bodies"}...</div>
                            ) : ministriesError ? (     
                                <div className="p-4 text-sm text-red-500">{ministriesError}</div>
                            ) : ministries.length > 0 ? (
                                <ul className="divide-y divide-[#eaf0fc] bg-white">
                                    {ministries.map((ministry, idx) => (
                                        <li
                                            key={ministry.id || ministry.name || idx}
                                            className="flex items-center px-4 py-2 text-sm text-[#001742] cursor-pointer hover:bg-[#f5f7fa]"
                                            onClick={() => setSelectedMinistry(ministry)}
                                        >
                                            {capitalizeFirstLetterEachWord(ministry.name || "")}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-4 text-sm text-[#4e5971]">No {activeTab === "governments" ? "government bodies" : "private bodies"} found.</div>
                            )}
                        </div>
                    </div>
            </div>
        </div>
    );
};

export default IndustryRegulation;