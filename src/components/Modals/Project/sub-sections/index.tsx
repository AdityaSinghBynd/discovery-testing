import { useEffect, useState, useRef } from "react";
import { getResearchReportsByBroker } from "@/redux/researchReport/researchReportThunks";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { Folder, Search, Lock } from "lucide-react";

const BrokersReport = () => {
    const dispatch: AppDispatch = useDispatch();
    const researchReportsByBroker = useSelector((state: RootState) => state.researchReport.researchReportsByBroker) as any;
    const isLoading = useSelector((state: RootState) => state.researchReport.isLoading);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        sector: "",
        broker: "",
        subAction: ""
    });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleReportClick = (report: any) => {
        console.log(report);
    }
    
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        dispatch(getResearchReportsByBroker({ 
            page: 1, 
            limit: 10, 
            filters: { search, ...filters } 
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
            dispatch(getResearchReportsByBroker({ 
                page: nextPage, 
                limit: 10, 
                filters: { search, ...filters } 
            }))
                .then((action: any) => {
                    if (action.payload?.data?.length < 10) {
                        setHasMore(false);
                    }
                });
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="sticky top-0 z-10 bg-white shadow-sm p-2 space-y-2 rounded-lg">
                <div className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium mb-2 flex items-center gap-1.5 justify-center">
                    <Lock className="w-3.5 h-3.5" />
                    Read Only Mode
                </div>
                <div className="relative rounded-lg bg-white p-1.5 shadow-sm border border-gray-200">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search for reports" 
                        className="w-full pl-8 pr-3 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 placeholder-gray-400 text-sm"
                    />
                </div>
            </div>
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-2 py-1"
            >
                <div className="grid gap-2">
                    {researchReportsByBroker?.length > 0 ? (
                        researchReportsByBroker.map((report: any, index: number) => (
                            <div 
                                key={index} 
                                className="bg-white p-1.5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer rounded-lg"
                                onClick={() => handleReportClick(report)}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-50 rounded-lg">
                                        <Folder className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                            <span className="font-medium">{report.broker.replace('_', ' ')}</span>
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium`}
                                        >
                                            {report.report_count}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No reports found</p>
                        </div>
                    )}
                    {isLoading && (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent"></div>
                        </div>
                    )}
                    {!hasMore && researchReportsByBroker?.length > 0 && (
                        <div className="text-center py-4 text-gray-500">
                            No more reports to load
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BrokersReport;