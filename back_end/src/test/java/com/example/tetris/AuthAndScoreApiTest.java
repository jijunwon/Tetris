package com.example.tetris;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.tetris.repository.ScoreRepository;
import com.example.tetris.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

@SpringBootTest
@AutoConfigureMockMvc
class AuthAndScoreApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ScoreRepository scoreRepository;

    @BeforeEach
    void clean() {
        scoreRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void signupStoresBcryptPasswordAndRejectsDuplicateUsername() throws Exception {
        signup("테트리스왕", "player", "secret")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("player"))
                .andExpect(jsonPath("$.nickname").value("테트리스왕"))
                .andExpect(jsonPath("$.password").doesNotExist());

        assertThat(userRepository.findByUsername("player").orElseThrow().getPassword()).startsWith("$2");

        signup("다른닉네임", "player", "secret")
                .andExpect(status().isConflict());
    }

    @Test
    void signupRejectsDuplicateNicknameEvenWithSurroundingSpaces() throws Exception {
        signup("테트리스왕", "player", "secret")
                .andExpect(status().isCreated());

        signup("테트리스왕", "other", "secret")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("이미 사용 중인 닉네임입니다."));
        signup(" 테트리스왕 ", "other", "secret")
                .andExpect(status().isConflict());

        assertThat(userRepository.existsByUsername("other")).isFalse();
    }

    @Test
    void loginThenSaveScoreRequiresSessionAndShowsNickname() throws Exception {
        signup("테트리스왕", "player", "secret")
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/scores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(scoreJson(1200, 4)))
                .andExpect(status().isUnauthorized());

        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials("player", "secret")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("player"))
                .andExpect(jsonPath("$.nickname").value("테트리스왕"))
                .andReturn();
        MockHttpSession session = (MockHttpSession) login.getRequest().getSession(false);
        assertThat(session).isNotNull();

        mockMvc.perform(post("/api/scores")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(scoreJson(1200, 4)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("player"))
                .andExpect(jsonPath("$.score").value(1200));

        mockMvc.perform(get("/api/scores/top"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nickname").value("테트리스왕"))
                .andExpect(jsonPath("$[0].score").value(1200));

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value("테트리스왕"));

        mockMvc.perform(post("/api/auth/logout").session(session))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginWithWrongPasswordIsUnauthorized() throws Exception {
        signup("테트리스왕", "player", "secret")
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials("player", "wrong")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void pagesOutsideApiDoNotRequireLogin() throws Exception {
        mockMvc.perform(get("/index.html"))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isNotEqualTo(401));
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void blankSignupIsBadRequest() throws Exception {
        signup("테트리스왕", " ", "secret")
                .andExpect(status().isBadRequest());
    }

    @Test
    void signupWithoutNicknameIsBadRequest() throws Exception {
        signup(" ", "player", "secret")
                .andExpect(status().isBadRequest());
    }

    private ResultActions signup(String nickname, String username, String password) throws Exception {
        String body = "{\"nickname\":\"" + nickname + "\",\"username\":\"" + username
                + "\",\"password\":\"" + password + "\"}";
        return mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body));
    }

    private String credentials(String username, String password) {
        return "{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}";
    }

    private String scoreJson(int score, int clearedLines) {
        return "{\"score\":" + score + ",\"clearedLines\":" + clearedLines + "}";
    }
}
