import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera, Mic, MapPin, Loader2 } from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useToast } from "@/hooks/use-toast";
import { submitToN8nWebhook } from "@/lib/api";

interface ReportTabProps {
  user: { id: string; username: string; email: string } | null;
}

export function ReportTab({ user }: ReportTabProps) {
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  const { latitude, longitude, error: locationError, loading: locationLoading, refetch: refetchLocation } = useGeolocation();
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAudio(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const file = new File([blob], 'recording.wav', { type: 'audio/wav' });
        setSelectedAudio(file);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record audio.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please provide a description of the hazard.",
        variant: "destructive",
      });
      return;
    }

    if (latitude === null || longitude === null) {
      toast({
        title: "Location required",
        description: "Please enable location access to submit a report.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a report.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare FormData for n8n webhook
      const formData = new FormData();
      formData.append('description', description);
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      formData.append('userId', user.id);
      formData.append('timestamp', new Date().toISOString());
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      if (selectedAudio) {
        formData.append('voice', selectedAudio);
      }

      // Submit to n8n webhook
      await submitToN8nWebhook(formData);

      toast({
        title: "Report submitted successfully!",
        description: "Your hazard report has been submitted to the community.",
      });

      // Reset form
      setDescription("");
      setSelectedImage(null);
      setSelectedAudio(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (audioInputRef.current) audioInputRef.current.value = "";

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setDescription("");
    setSelectedImage(null);
    setSelectedAudio(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (audioInputRef.current) audioInputRef.current.value = "";
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">Report Ocean Hazard</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe the ocean hazard you've observed..."
            className="resize-none"
            data-testid="textarea-description"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Upload Photo
            </Label>
            <div 
              className="border border-dashed border-border rounded-lg p-4 text-center hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => imageInputRef.current?.click()}
              data-testid="button-upload-photo"
            >
              <Camera className="text-muted-foreground text-xl mb-2 mx-auto" size={24} />
              <p className="text-muted-foreground text-xs">
                {selectedImage ? selectedImage.name : "Tap to add photo"}
              </p>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                data-testid="input-image"
              />
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Record Audio
            </Label>
            <div className="space-y-2">
              <div 
                className="border border-dashed border-border rounded-lg p-4 text-center hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={isRecording ? stopRecording : startRecording}
                data-testid="button-record-audio"
              >
                <Mic className={`text-muted-foreground text-xl mb-2 mx-auto ${isRecording ? 'text-destructive animate-pulse' : ''}`} size={24} />
                <p className="text-muted-foreground text-xs">
                  {isRecording ? "Tap to stop" : (selectedAudio ? selectedAudio.name : "Tap to record")}
                </p>
              </div>
              
              <div 
                className="border border-dashed border-border rounded-lg p-2 text-center hover:bg-accent/50 transition-colors cursor-pointer text-xs"
                onClick={() => audioInputRef.current?.click()}
              >
                Or upload file
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                  data-testid="input-audio"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="text-primary h-4 w-4" />
            <span className="text-foreground">Current Location:</span>
            {locationLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          
          {locationError ? (
            <div className="mt-1">
              <div className="text-destructive text-xs">{locationError}</div>
              <Button 
                type="button" 
                variant="link" 
                size="sm" 
                onClick={refetchLocation}
                className="text-xs p-0 h-auto"
                data-testid="button-retry-location"
              >
                Retry
              </Button>
            </div>
          ) : latitude !== null && longitude !== null ? (
            <>
              <div className="mt-1 text-muted-foreground text-xs" data-testid="text-coordinates">
                Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}
              </div>
              <div className="text-muted-foreground text-xs">
                Location accuracy available
              </div>
            </>
          ) : (
            <div className="mt-1 text-muted-foreground text-xs">
              Getting location...
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <Button 
            type="button" 
            variant="secondary"
            className="flex-1"
            onClick={handleCancel}
            disabled={isSubmitting}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="flex-1"
            disabled={isSubmitting || !description.trim() || latitude === null || longitude === null}
            data-testid="button-submit-report"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
