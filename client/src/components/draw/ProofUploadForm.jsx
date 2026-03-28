import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X, Image, AlertCircle, CheckCircle } from "lucide-react";
import api from "../../services/api";

const ProofUploadForm = ({ winning, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const validateFile = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/heic", "image/webp"];
    const maxSize = 5 * 1024 * 1024;
    if (!validTypes.includes(file.type)) return "Invalid file type. Please upload JPG, PNG, HEIC, or WEBP images.";
    if (file.size > maxSize) return "File size must be less than 5MB.";
    return null;
  };

  const handleFile = (file) => {
    const validationError = validateFile(file);
    if (validationError) { setError(validationError); return; }
    setError(null);
    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("drawId", winning.drawId);
      formData.append("winnerId", winning.id || winning._id);
      await api.post("/api/draws/" + winning.drawId + "/winners/" + (winning.id || winning._id) + "/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload proof. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-800 mb-4">Submit Your Score Proof</h3>
      <p className="text-sm text-gray-600 mb-4">Please upload a clear photo of your scorecard as proof. Your submission will be reviewed by our team.</p>
      <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? "border-emerald-500 bg-emerald-50" : "border-gray-300 hover:border-gray-400"} ${file ? "pointer-events-none" : "cursor-pointer"}`} onClick={() => !file && fileInputRef.current?.click()}>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/heic,image/webp" onChange={handleChange} className="hidden" />
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
            <button type="button" onClick={(e) => { e.stopPropagation(); clearFile(); }} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dragActive ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
              {dragActive ? <Image size={24} /> : <Upload size={24} />}
            </div>
            <div>
              <p className="font-medium text-gray-700">Drop your scorecard here</p>
              <p className="text-sm text-gray-500">or click to browse</p>
            </div>
            <p className="text-xs text-gray-400">JPG, PNG, HEIC, WEBP (max 5MB)</p>
          </div>
        )}
      </div>
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
        </motion.div>
      )}
      {file && !uploading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-2 text-emerald-600 text-sm">
          <CheckCircle size={16} />
          {file.name} {(file.size / 1024 / 1024).toFixed(2)} MB
        </motion.div>
      )}
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={handleSubmit} disabled={!file || uploading} className={`flex-1 py-3 rounded-xl font-medium transition-colors ${file && !uploading ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
          {uploading ? "Uploading..." : "Submit Proof"}
        </button>
      </div>
    </div>
  );
};

export default ProofUploadForm;
