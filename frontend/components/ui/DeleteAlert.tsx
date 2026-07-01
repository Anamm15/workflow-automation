import { Trash } from "lucide-react";

type DeleteAlertProps = {
  title: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteAlert({
  title,
  onClose,
  onConfirm,
}: DeleteAlertProps) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex gap-4">
          <div className="w-12 h-12 shrink-0 bg-red-100 rounded-full flex items-center justify-center">
            <Trash className="w-6 h-6 text-danger" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete this section? This action cannot
              be undone.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
