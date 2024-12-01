import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ImageVolumeManagement = () => {
  const { vmName } = useParams();
  const [images, setImages] = useState([]);
  const [volumes, setVolumes] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [isLoadingVolumes, setIsLoadingVolumes] = useState(true);

  // Fetch images from the server
  const fetchImages = async () => {
    setIsLoadingImages(true);
    try {
      const response = await axios.get(`/api/metrics/images/${vmName}`);
      console.log(response.data);
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setIsLoadingImages(false);
    }
  };

  // Fetch volumes from the server
  const fetchVolumes = async () => {
    setIsLoadingVolumes(true);
    try {
      const response = await axios.get(`/api/metrics/volumes/${vmName}`);
      setVolumes(response.data);
    } catch (error) {
      console.error('Error fetching volumes:', error);
    } finally {
      setIsLoadingVolumes(false);
    }
  };

  // Remove an image
  const removeImage = async (imageId) => {
    try {
      await axios.delete(`/api/metrics/images/${vmName}/${imageId}`);
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  // Remove a volume
  const removeVolume = async (volumeName) => {
    try {
      await axios.delete(`/api/metrics/volumes/${vmName}/${volumeName}`);
      fetchVolumes();
    } catch (error) {
      console.error('Error deleting volume:', error);
    }
  };

  useEffect(() => {
    fetchImages();
    fetchVolumes();
  }, [vmName]);

  return (
    <div className="p-6 bg-card rounded-xl shadow-lg pb-10 mt-10">
      <h2 className="text-3xl font-bold mb-10">
        Manage Images & Volumes - {vmName.toUpperCase()}
      </h2>

      {/* Images Section */}
      <h3 className="text-xl font-semibold mb-4">Images</h3>
      {isLoadingImages ? (
        <p>Loading images...</p>
      ) : images.length > 0 ? (
        images.map((image, index) => (
          <div
            key={`${image.ID}-${index}`} 
            className="flex items-center justify-between mb-3 bg-lightBg px-4 py-2 rounded-xl"
          >
            <span>
              {image.Repository}  (ID: {image.ID})
            </span>
            <button
              onClick={() => removeImage(image.ID)}
              className="bg-red-500 text-white p-2 rounded-lg"
            >
              Delete
            </button>
          </div>
        ))
      ) : (
        <p>No images found</p>
      )}

      {/* Volumes Section */}
      <h3 className="text-xl font-semibold mt-8 mb-4">Volumes</h3>
      {isLoadingVolumes ? (
        <p>Loading volumes...</p> 
      ) : volumes.length > 0 ? (
        volumes.map((volume, index) => (
          <div
            key={`${volume.Name}-${index}`} 
            className="flex items-center justify-between mb-2 bg-lightBg px-4 py-2 rounded-xl"
          >
            <span>{volume.Name}</span>
            <button
              onClick={() => removeVolume(volume.Name)}
              className="bg-red-500 text-white p-2 rounded-lg"
            >
              Delete
            </button>
          </div>
        ))
      ) : (
        <p>No volumes found</p>
      )}
    </div>
  );
};

export default ImageVolumeManagement;

