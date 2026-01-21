import { forwardRef } from 'react';
import { Plyr } from 'plyr-react';
import 'plyr-react/plyr.css';

const VideoPlayer = forwardRef((props, ref) => {
    const { source, options, ...rest } = props;

    // Custom video options for a premium feel
    const videoOptions = {
        ...options,
        controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'mute',
            'volume',
            'captions',
            'settings',
            'pip',
            'airplay',
            'fullscreen'
        ],
        settings: ['captions', 'quality', 'speed'],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
        keyboard: {
            focused: true,
            global: true
        },
        title: props.title || 'Video'
    };

    return (
        <div className="plyr__wrapper rounded-2xl overflow-hidden shadow-2xl">
            <Plyr
                ref={ref}
                source={source}
                options={videoOptions}
                {...rest}
            />
        </div>
    );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
