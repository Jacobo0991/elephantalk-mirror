"use client";

import { Navbar } from "@/components/interface/Navbar";
import { MonitorModal } from "@/components/interface/MonitorModal";
import { GetReports } from "@/services/api";
import { formatDate } from "@/utils/formatDate";
import { useSession } from "next-auth/react";
import React from "react";
import { LuEye } from "react-icons/lu";
import ClipLoader from "react-spinners/ClipLoader";
import { HistoryModal } from "@/components/HistoryModal";
import SelectOption from "@/components/SelectOption";
import { SortIcon } from "@/components/interface/SortIcon";

export default function Home() {
  const [activePage, setActivePage] = React.useState("monitor");
  const [page, setPage] = React.useState(1);
  const [pages, setPages] = React.useState(1);
  const [reports, setReports] = React.useState([]);
  const [selectedRep, setSelectedRep] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [rep, setReport] = React.useState({});
  const [refresh, setRefresh] = React.useState(false);
  const [monitorOpen, setMonitorOpen] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);

  //estado para poder cambiar el filtrado de los reportes
  const [filterOption, setFilterOption] = React.useState("todos");

  //estado para identificar cambio en ordenamiento por defecto estará ordenado en sentido ascendente
  const [clickEvent, setClickEvent] = React.useState(false);

  const session = useSession();

  React.useEffect(() => {
    if (!session?.data?.accessToken) {
      return;
    }

    if (activePage === "monitor") {
      const fetchReports = async () => {
        try {
          setLoading(true);

          const query = new URLSearchParams({ limit: 10, page });
          if (filterOption !== "todos") query.append("type", filterOption);

          if (clickEvent) query.append("order", "desc");
          else query.append("order", "asc");

          const { data } = await GetReports({
            token: session?.data?.accessToken,
            endpoint: "monitor",
            query: query.toString(),
          });

          setReports(data?.reports);
          setPages(data?.pagination.pages);

          setLoading(false);
        } catch (error) {
          setLoading(false);
          //showAlert("Oops try again later...", "error");
        }
      };

      fetchReports();
      if (refresh) {
        setRefresh(false);
      }
    } else if (activePage === "history") {
      const fetchReports = async () => {
        try {
          setLoading(true);

          const query = new URLSearchParams({ limit: 10, page });
          if (filterOption !== "todos") query.append("type", filterOption);

          if (clickEvent) query.append("order", "desc");
          else query.append("order", "asc");

          const { data } = await GetReports({
            token: session?.data?.accessToken,
            endpoint: "history",
            query: query.toString(),
          });

          setReports(data?.reports);
          setPages(data?.pagination.pages);

          setLoading(false);
        } catch (error) {
          setLoading(false);
          //showAlert("Oops try again later...", "error");
        }
      };

      fetchReports();
      if (refresh) {
        setRefresh(false);
      }
    }
  }, [session, activePage, page, refresh, filterOption, clickEvent]);

  React.useEffect(() => {
    if (selectedRep === "") {
      return;
    }

    const fetchReport = async () => {
      try {
        const report = await GetReports({
          token: session?.data?.accessToken,
          endpoint: selectedRep,
        });

        if (activePage === "monitor") {
          setReport(report?.data);
          setMonitorOpen(true);
        } else if (activePage === "history") {
          setReport(report?.data);
          setHistoryOpen(true);
        }
      } catch (error) {}
    };

    fetchReport();
  }, [selectedRep]);

  React.useEffect(() => {
    if (historyOpen === false || monitorOpen === false) {
      setSelectedRep("");
      if (refresh) setRefresh(false);
    }
  }, [historyOpen, monitorOpen]);

  const loadNext = () => {
    setPage((page) => page + 1);
  };

  const loadLast = () => {
    setPage((page) => page - 1);
  };

  // Selected filter option handler
  const handleSelectFilterOptionChange = (event) => {
    setFilterOption(event.target.value);
  };

  //función para determinar si se ha hecho click sobre el ícono de ordenamiento
  function handleIcon(click) {
    setClickEvent(!click);
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <Navbar activePage={activePage} setActivePage={setActivePage} />
        <main className="p-4">
          <div className="flex justify-between items-center mt-6">
            <h2 className="text-xl font-semibold mb-4 text-darkprim">
              {activePage === "monitor" ? "Report monitor" : "Report history"}
            </h2>
            <div className="flex justify-end mb-4">
              <SelectOption
                filterOption={filterOption}
                handleSelectFilterOptionChange={handleSelectFilterOptionChange}
              />
            </div>
          </div>

          <div className="bg-white shadow-md rounded-md overflow-hidden mt-6">
            <MonitorModal
              report={rep}
              isOpen={monitorOpen}
              onClose={() => setMonitorOpen(false)}
              refresh={setRefresh}
            />
            <HistoryModal
              report={rep}
              isOpen={historyOpen}
              onClose={() => setHistoryOpen(false)}
            />
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-primary">
                <tr className="text-white">
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Report type
                  </th>
                  <th
                    className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider flex
                  justify-center items-center gap-3"
                  >
                    Created At
                    <SortIcon eventClick={handleIcon} />
                  </th>
                  {activePage === "history" && (
                    <>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                        Decision
                      </th>
                    </>
                  )}
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-gray-500">
                {!loading && (
                  <>
                    {activePage === "monitor" && (
                      <>
                        {reports?.map(({ _id, user, type, createdAt }, i) => (
                          <tr key={`${i} - ${createdAt}`}>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              {user.username}
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              {type}
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              {formatDate(createdAt)}
                            </td>
                            <td className="px-6 py-4 flex justify-center items-center whitespace-nowrap">
                              <LuEye
                                className="text-gray-500 hover:text-primary cursor-pointer"
                                onClick={() => setSelectedRep(_id)}
                              />
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                    {activePage === "history" && (
                      <>
                        {reports?.map(
                          ({ _id, user, type, createdAt, status }, i) => (
                            <tr key={`${i} - ${createdAt}`}>
                              <td className="px-6 py-4 text-center whitespace-nowrap">
                                {user.username}
                              </td>
                              <td className="px-6 py-4 text-center whitespace-nowrap">
                                {type}
                              </td>
                              <td className="px-6 py-4 text-center whitespace-nowrap">
                                {formatDate(createdAt)}
                              </td>
                              <td className="px-6 py-4 text-center whitespace-nowrap">
                                {status}
                              </td>
                              <td className="px-6 py-4 flex justify-center items-center whitespace-nowrap">
                                <LuEye
                                  className="text-gray-500 hover:text-primary cursor-pointer"
                                  onClick={() => setSelectedRep(_id)}
                                />
                              </td>
                            </tr>
                          )
                        )}
                      </>
                    )}
                  </>
                )}
              </tbody>
            </table>
            {loading && (
              <article className="flex items-center justify-center w-full h-[16rem]">
                <ClipLoader color="#25a2b5" size={70} />
              </article>
            )}

            {session?.data?.user && !loading && reports?.length === 0 && (
              <article className="flex items-center justify-center w-full h-[16rem]">
                <p className="text-gray-500">No reports found</p>
              </article>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            {pages > 0 && (
              <div className="text-gray-500">
                Page {page}/{pages}
              </div>
            )}
            {pages > 1 && (
              <div className="flex space-x-2">
                <button
                  className="p-2 bg-primary hover:bg-darkprim text-white rounded-md cursor-pointer disabled:opacity-50 disabled:hover:bg-primary"
                  onClick={loadLast}
                  disabled={page === 1}
                >
                  {"<"}
                </button>
                <button
                  className="p-2 bg-primary hover:bg-darkprim text-white rounded-md cursor-pointer disabled:opacity-50 disabled:hover:bg-primary"
                  onClick={loadNext}
                  disabled={page === pages}
                >
                  {">"}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
