import { useEffect, useState, useRef } from "react";
import { getResearchReportsByBroker } from "@/redux/researchReport/researchReportThunks";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { Folder, Search, Lock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ResearchReport = () => {
    const dispatch: AppDispatch = useDispatch();
    const researchReportsByBroker = useSelector((state: RootState) => state.researchReport.researchReportsByBroker) as any;
    const isLoading = useSelector((state: RootState) => state.researchReport.isLoading);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        sector: "all",
        broker: "all",
        subAction: ""
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState("Company Notes");

    const handleReportClick = (report: any) => {
        console.log(report);
    }
    
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        const searchFilters = {
            search,
            sector: filters.sector === "all" ? "" : filters.sector,
            broker: filters.broker === "all" ? "" : filters.broker,
            subAction: filters.subAction
        };
        dispatch(getResearchReportsByBroker({ 
            page: 1, 
            limit: 10, 
            filters: searchFilters 
        }));
    }, [dispatch, search, filters]);

    useEffect(() => {
        if (researchReportsByBroker?.length > 0) {
            setHasMore(researchReportsByBroker.length >= 10);
        } else {
            setHasMore(false);
        }
    }, [researchReportsByBroker]);

    const handleScroll = () => {
        if (!containerRef.current || isLoading || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const scrollThreshold = scrollHeight - clientHeight - 20;
        
        if (scrollTop >= scrollThreshold) {
            const nextPage = page + 1;
            setPage(nextPage);
            const searchFilters = {
                search,
                sector: filters.sector === "all" ? "" : filters.sector,
                broker: filters.broker === "all" ? "" : filters.broker,
                subAction: filters.subAction
            };
            dispatch(getResearchReportsByBroker({ 
                page: nextPage, 
                limit: 10, 
                filters: searchFilters 
            }))
                .then((action: any) => {
                    if (action.payload?.data?.length < 10) {
                        setHasMore(false);
                    }
                });
        }
    };

    // Mock data for better demonstration
    const mockReports = [
        {
            company_name: "Swiggy Pvt Ltd",
            broker: "ICICI Securities Limited",
            sector: "Quick commerce",
            date: "15 Jan",
            recommendation: "Buy"
        },
        {
            company_name: "Zomato Pvt Ltd",
            broker: "ICICI Securities Limited", 
            sector: "Quick commerce",
            date: "15 Jan",
            recommendation: "Buy"
        },
        {
            company_name: "Zomato Pvt Ltd",
            broker: "ICICI Securities Limited",
            sector: "Quick commerce", 
            date: "15 Jan",
            recommendation: "Neutral"
        },
        {
            company_name: "Swiggy Pvt Ltd",
            broker: "ICICI Securities Limited",
            sector: "Quick commerce",
            date: "15 Jan", 
            recommendation: "Buy"
        },
        {
            company_name: "Zomato Pvt Ltd",
            broker: "ICICI Securities Limited",
            sector: "Quick commerce",
            date: "15 Jan",
            recommendation: "Buy"
        },
        {
            company_name: "Zomato Pvt Ltd",
            broker: "ICICI Securities Limited",
            sector: "Quick commerce",
            date: "15 Jan",
            recommendation: "Buy"
        },
        {
            company_name: "Zomato Pvt Ltd",
            broker: "ICICI Securities Limited",
            sector: "Quick commerce",
            date: "15 Jan",
            recommendation: "Buy"
        },
        {
            company_name: "Zomato Pvt Ltd",
            broker: "ICICI Securities Limited",
            sector: "Quick commerce",
            date: "15 Jan",
            recommendation: "Buy"
        },
        {
            company_name: "Zomato Pvt Ltd",
            broker: "ICICI Securities Limited",
            sector: "Quick commerce",
            date: "15 Jan",
            recommendation: "Buy"
        }
    ];

    const displayReports = researchReportsByBroker?.length > 0 ? researchReportsByBroker : mockReports;

    return (
        <div className="flex flex-col h-full">
            {/* Tab Header */}
            <div className="flex items-center gap-6 mb-4">
                <button
                    onClick={() => setActiveTab("Company Notes")}
                    className={`px-0 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "Company Notes"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Company Notes
                </button>
                <button
                    onClick={() => setActiveTab("Industry Notes")}
                    className={`px-0 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "Industry Notes"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Industry Notes
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-4">
                <Select value={filters.broker} onValueChange={(value) => setFilters(prev => ({ ...prev, broker: value }))}>
                    <SelectTrigger className="w-[160px] h-8 text-sm border-gray-300">
                        <SelectValue placeholder="All Brokers" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Brokers</SelectItem>
                        <SelectItem value="ICICI Securities Limited">ICICI Securities</SelectItem>
                        <SelectItem value="Motilal Oswal">Motilal Oswal</SelectItem>
                        <SelectItem value="Geojit Financial Services">Geojit Financial</SelectItem>
                        <SelectItem value="JM Financial">JM Financial</SelectItem>
                        <SelectItem value="Elara Capital">Elara Capital</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filters.sector} onValueChange={(value) => setFilters(prev => ({ ...prev, sector: value }))}>
                    <SelectTrigger className="w-[160px] h-8 text-sm border-gray-300">
                        <SelectValue placeholder="All sectors" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All sectors</SelectItem>
                        <SelectItem value="Quick commerce">Quick commerce</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-lg border border-gray-200 flex-1 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="text-sm font-medium text-gray-700">Name</div>
                    <div className="text-sm font-medium text-gray-700">Broker</div>
                    <div className="text-sm font-medium text-gray-700">Sector</div>
                    <div className="text-sm font-medium text-gray-700">Date</div>
                </div>

                {/* Table Content */}
                <div
                    ref={containerRef}
                    onScroll={handleScroll}
                    className="overflow-y-auto max-h-[400px]"
                >
                    {displayReports?.length > 0 ? (
                        displayReports.map((report: any, index: number) => (
                            <div 
                                key={index} 
                                className="grid grid-cols-4 gap-4 px-4 py-3 hover:bg-gray-50 transition-colors duration-200 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => handleReportClick(report)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center flex-shrink-0">
                                        <Folder className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {report.company_name || "Swiggy Pvt Ltd"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-600 truncate">
                                        {report.broker?.replace('_', ' ') || "ICICI Securities Limited"}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-600 truncate">
                                        {report.sector || "Quick commerce"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                        {report.date || "15 Jan"}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                                        report.recommendation === "Buy" || (!report.recommendation && Math.random() > 0.5)
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-600"
                                    }`}>
                                        {report.recommendation || (Math.random() > 0.5 ? "Buy" : "Neutral")}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No reports found</p>
                            <p className="text-gray-400 text-sm">Try adjusting your filters or search terms</p>
                        </div>
                    )}
                    {isLoading && (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                        </div>
                    )}
                    {!hasMore && displayReports?.length > 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                            No more reports to load
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResearchReport;
