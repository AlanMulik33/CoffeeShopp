import { usePosStore } from '../store/posStore'

function ReportDateFilter({ totalData = 0 }) {
  const reportFilterMode = usePosStore((state) => state.reportFilterMode)
  const reportStartDate = usePosStore((state) => state.reportStartDate)
  const reportEndDate = usePosStore((state) => state.reportEndDate)

  const setReportFilterMode = usePosStore((state) => state.setReportFilterMode)
  const setReportStartDate = usePosStore((state) => state.setReportStartDate)
  const setReportEndDate = usePosStore((state) => state.setReportEndDate)
  const resetReportFilterToday = usePosStore(
    (state) => state.resetReportFilterToday
  )

  return (
    <div className="rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold text-[#2d1810]">
            Filter Tanggal
          </p>
          <p className="mt-1 text-xs text-[#7b5d4a]">
            Menampilkan {totalData} transaksi sesuai filter.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={resetReportFilterToday}
            className={`rounded-2xl border px-4 py-3 text-xs font-bold transition ${
              reportFilterMode === 'today'
                ? 'border-[#2d1810] bg-[#2d1810] text-white'
                : 'border-[#ead8c0] bg-white text-[#6f3f24] hover:bg-[#fff4e7]'
            }`}
          >
            Hari Ini
          </button>

          <button
            onClick={() => setReportFilterMode('all')}
            className={`rounded-2xl border px-4 py-3 text-xs font-bold transition ${
              reportFilterMode === 'all'
                ? 'border-[#2d1810] bg-[#2d1810] text-white'
                : 'border-[#ead8c0] bg-white text-[#6f3f24] hover:bg-[#fff4e7]'
            }`}
          >
            Semua
          </button>

          <button
            onClick={() => setReportFilterMode('custom')}
            className={`rounded-2xl border px-4 py-3 text-xs font-bold transition ${
              reportFilterMode === 'custom'
                ? 'border-[#2d1810] bg-[#2d1810] text-white'
                : 'border-[#ead8c0] bg-white text-[#6f3f24] hover:bg-[#fff4e7]'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {reportFilterMode === 'custom' && (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#b88746]">
              Tanggal Mulai
            </label>

            <input
              type="date"
              value={reportStartDate}
              onChange={(event) => setReportStartDate(event.target.value)}
              className="w-full rounded-2xl border border-[#ead8c0] bg-white px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#b88746]">
              Tanggal Akhir
            </label>

            <input
              type="date"
              value={reportEndDate}
              onChange={(event) => setReportEndDate(event.target.value)}
              className="w-full rounded-2xl border border-[#ead8c0] bg-white px-4 py-3 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportDateFilter