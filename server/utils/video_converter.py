import os
import subprocess
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def convert_webm_to_mp4(input_path, output_path):
    """
    Converts a WEBM video to MP4 using FFmpeg.
    
    Args:
        input_path (str): Path to the source .webm file.
        output_path (str): Path where the .mp4 file should be saved.
        
    Returns:
        bool: True if conversion was successful, False otherwise.
    """
    try:
        if not os.path.exists(input_path):
            logger.error(f"Input file not found: {input_path}")
            return False

        # Command to convert webm to mp4 using ffmpeg
        # -i: input file
        # -c:v libx264: use H.264 codec for video (widely supported)
        # -preset fast: encoding speed
        # -c:a aac: use AAC codec for audio
        # -y: overwrite output file if exists
        command = [
            'ffmpeg', '-y',
            '-i', input_path,
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '22', # Constant Rate Factor (quality control)
            '-c:a', 'aac',
            '-b:a', '128k', # Audio bitrate
            output_path
        ]

        logger.info(f"Starting conversion: {input_path} -> {output_path}")
        
        # Run ffmpeg command
        result = subprocess.run(
            command, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            text=True
        )
        
        if result.returncode != 0:
            logger.error(f"FFmpeg conversion failed: {result.stderr}")
            return False
            
        logger.info("Conversion successful")
        return True
        
    except Exception as e:
        logger.error(f"Exception during conversion: {str(e)}")
        return False
