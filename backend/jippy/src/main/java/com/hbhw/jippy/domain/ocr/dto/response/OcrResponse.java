package com.hbhw.jippy.domain.ocr.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class OcrResponse {
    private String id;
    private String status;
    private Long created;
    private Long completed;
    private List<Page> pages;
    private String error;

    @Data
    @NoArgsConstructor
    public static class Page {
        private Integer width;
        private Integer height;
        private List<Word> words;
        private List<Line> lines;
        private List<Table> tables;

        @Data
        @NoArgsConstructor
        public static class Word {
            private String text;
            @JsonProperty("bounding_box")
            private BoundingBox boundingBox;
            private Double confidence;
            private String lang;
            private String font;
        }

        @Data
        @NoArgsConstructor
        public static class Line {
            private String text;
            @JsonProperty("bounding_box")
            private BoundingBox boundingBox;
            private List<Word> words;
        }

        @Data
        @NoArgsConstructor
        public static class Table {
            @JsonProperty("bounding_box")
            private BoundingBox boundingBox;
            private List<Cell> cells;
        }

        @Data
        @NoArgsConstructor
        public static class Cell {
            @JsonProperty("bounding_box")
            private BoundingBox boundingBox;
            private Integer rowIndex;
            private Integer colIndex;
            private Integer rowSpan;
            private Integer colSpan;
            private String text;
            private List<Word> words;
        }

        @Data
        @NoArgsConstructor
        public static class BoundingBox {
            private List<Vertices> vertices;

            @Data
            @NoArgsConstructor
            public static class Vertices {
                private Integer x;
                private Integer y;
            }
        }
    }
}