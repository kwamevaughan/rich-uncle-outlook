export default function PreviewTable({ filteredUsers, csvHeaders, previewRows, mode }) {
    return (
        <div
            className={`mt-2 p-4 rounded-lg border max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#f05d23] scrollbar-track-gray-200 ${
                mode === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
            }`}
        >
            <table className="w-full text-xs">
                <thead>
                <tr className={mode === "dark" ? "bg-gray-600" : "bg-gray-100"}>
                    {csvHeaders.map((header) => (
                        <th key={header.key} className="p-2 text-left font-semibold">
                            {header.label}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {filteredUsers.slice(0, previewRows).map((user, index) => (
                    <tr
                        key={index}
                        className={`border-b ${
                            mode === "dark" ? "border-gray-600" : "border-gray-200"
                        }`}
                    >
                        {csvHeaders.map((header) => (
                            <td key={header.key} className="p-2">
                                {user[header.key]}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}